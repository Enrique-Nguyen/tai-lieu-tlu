"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function formatDateVN(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function updateProfileAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật thông tin cá nhân.",
      };
    }

    // 1. Fetch current profile to check 90-day cooldown
    const { data: currentProfile, error: profileError } = await supabase
      .from("users")
      .select("last_profile_update, is_profile_completed")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Lỗi khi tải thông tin người dùng:", profileError);
    }

    const now = new Date();
    const lastUpdateStr = currentProfile?.last_profile_update;

    if (lastUpdateStr) {
      const lastUpdateDate = new Date(lastUpdateStr);
      const diffMs = now.getTime() - lastUpdateDate.getTime();

      if (diffMs < NINETY_DAYS_MS) {
        const remainingMs = NINETY_DAYS_MS - diffMs;
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const unlockDate = new Date(lastUpdateDate.getTime() + NINETY_DAYS_MS);
        const formattedUnlockDate = formatDateVN(unlockDate);

        return {
          success: false,
          error: `Bạn vừa cập nhật thông tin gần đây. Bạn có thể sửa lại thông tin sau ${remainingDays} ngày nữa (vào ngày ${formattedUnlockDate}).`,
          remainingDays,
          unlockDate: formattedUnlockDate,
        };
      }
    }

    // 2. Extract form data
    const fullName = (formData.get("fullName") as string)?.trim();
    const academicYear = (formData.get("academicYear") as string)?.trim();
    const major = (formData.get("major") as string)?.trim();
    const studentClass = (formData.get("studentClass") as string)?.trim() || null;
    const presetAvatar = (formData.get("presetAvatar") as string)?.trim();
    const avatarFile = formData.get("avatarFile") as File | null;

    if (!fullName) {
      return { success: false, error: "Vui lòng nhập Họ và tên." };
    }

    if (!academicYear) {
      return { success: false, error: "Vui lòng nhập Niên khóa (ví dụ: K67 hoặc Khác)." };
    }

    if (!major) {
      return { success: false, error: "Vui lòng chọn Chuyên ngành." };
    }

    // 3. Resolve Avatar URL
    let finalAvatarUrl: string | null = presetAvatar || null;

    if (avatarFile && avatarFile.size > 0) {
      // Ensure 'avatars' bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarsBucketExists = buckets?.some((b) => b.name === "avatars");
        if (!avatarsBucketExists) {
          await supabase.storage.createBucket("avatars", { public: true });
        }
      } catch (err) {
        console.warn("Could not auto-create avatars bucket:", err);
      }

      // Structure as avatars/{user_id}.webp and overwrite (upsert: true)
      const filePath = `${user.id}.webp`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          contentType: "image/webp",
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        return {
          success: false,
          error: `Tải ảnh đại diện thất bại: ${uploadError.message}`,
        };
      }

      // Retrieve public URL with cache-busting timestamp
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

      finalAvatarUrl = `${publicUrl}?t=${Date.now()}`;
    }

    // 4. Update `users` record
    const { error: updateError } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        academic_year: academicYear,
        major: major,
        student_class: studentClass,
        avatar_url: finalAvatarUrl,
        is_profile_completed: true,
        last_profile_update: now.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update profile error:", updateError);
      return {
        success: false,
        error: `Cập nhật thông tin thất bại: ${updateError.message}`,
      };
    }

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      success: true,
      message: "Cập nhật thông tin cá nhân thành công!",
    };
  } catch (err: any) {
    console.error("System error during profile update:", err);
    return {
      success: false,
      error: err.message || "Đã xảy ra lỗi hệ thống khi cập nhật hồ sơ.",
    };
  }
}
