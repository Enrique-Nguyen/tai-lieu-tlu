"use server";

import { createClient } from "@/lib/server";
import { checkUserBlockStatus } from "@/lib/server-guard";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
// Mapping from frontend slug -> DB enum value (posts_category_check constraint)
const CATEGORY_MAP: Record<string, string> = {
  dethi: "Đề thi",
  slide: "Slide bài giảng",
  doan: "Đồ án mẫu",
  giaotrinh: "Sách/Giáo trình",
};

export async function createPostAction(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để tải lên tài liệu.",
      };
    }

    // Check if user account is banned or suspended
    const blockCheck = await checkUserBlockStatus(user.id);
    if (blockCheck.isBlocked) {
      return {
        success: false,
        error: blockCheck.error || "Tài khoản của bạn đang bị hạn chế.",
      };
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const categoryRaw = formData.get("category") as string;
    const isNewSubject = formData.get("isNewSubject") === "true";

    const attachMode = formData.get("attachMode") as "file" | "link";
    const externalLink = (formData.get("externalLink") as string)?.trim();

    if (!title) {
      return { success: false, error: "Vui lòng nhập tiêu đề tài liệu." };
    }

    if (!categoryRaw) {
      return { success: false, error: "Vui lòng chọn Danh mục tài liệu." };
    }

    // Map slug to actual DB enum value (posts_category_check constraint)
    const category = CATEGORY_MAP[categoryRaw] ?? null;
    if (!category) {
      return { success: false, error: "Danh mục tài liệu không hợp lệ. Vui lòng chọn lại." };
    }

    let finalSubjectId: string | null = null;

    // --- Subject Resolution Logic ---
    if (isNewSubject) {
      const rawCode = (formData.get("newSubjectCode") as string) || "";
      const rawName = (formData.get("newSubjectName") as string) || "";
      const faculty =
        (formData.get("newSubjectFaculty") as string) || "Công nghệ Thông tin";
      const department =
        (formData.get("newSubjectDepartment") as string) || "Kỹ thuật Phần mềm";

      if (!rawCode.trim()) {
        return { success: false, error: "Vui lòng nhập Mã môn học mới." };
      }
      if (!rawName.trim()) {
        return { success: false, error: "Vui lòng nhập Tên môn học mới." };
      }

      // Step 1: Normalize Subject Code (Strip spaces & Convert to UPPERCASE)
      const normalizedCode = rawCode.trim().replace(/\s+/g, "").toUpperCase();
      const trimmedName = rawName.trim();

      // Step 2: Query database case-insensitively using ilike
      const { data: existingSubject } = await supabase
        .from("subjects")
        .select("id")
        .ilike("code", normalizedCode)
        .maybeSingle();

      if (existingSubject) {
        // Step 3: Subject already exists -> Reuse existing subject ID
        finalSubjectId = existingSubject.id;
      } else {
        // Step 4: Subject does NOT exist -> Create new record in DB with faculty AND department
        const { data: newSubject, error: subError } = await supabase
          .from("subjects")
          .insert({
            code: normalizedCode,
            name: trimmedName,
            faculty: faculty,
            department: department,
          })
          .select("id")
          .single();

        if (subError) {
          console.error("Lỗi khi tạo môn học mới:", subError);
          return {
            success: false,
            error: `Tạo môn học mới thất bại: ${subError.message}`,
          };
        }

        finalSubjectId = newSubject.id;
      }
    } else {
      finalSubjectId = formData.get("subjectId") as string;
      if (!finalSubjectId) {
        return { success: false, error: "Vui lòng chọn Môn học từ danh sách." };
      }
    }

    // --- Attachment Handling ---
    let finalFileUrl: string | null = null;
    let finalFileType: string = "external_link";

    if (attachMode === "file") {
      const file = formData.get("file") as File | null;

      if (!file || file.size === 0) {
        return { success: false, error: "Vui lòng chọn tệp tin cần tải lên." };
      }

      // Validate File Size (Max 5MB)
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error:
            "File vượt quá 5MB. Vui lòng upload lên Google Drive/Fshare và sử dụng phương thức dán Link.",
        };
      }

      // Determine File Type
      const fileName = file.name;
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

      if (["pdf"].includes(fileExt)) {
        finalFileType = "pdf";
      } else if (["docx", "doc"].includes(fileExt)) {
        finalFileType = "docx";
      } else if (["zip", "rar", "7z"].includes(fileExt)) {
        finalFileType = "zip";
      } else if (["png", "jpg", "jpeg", "webp"].includes(fileExt)) {
        finalFileType = "image";
      } else {
        finalFileType = fileExt || "other";
      }

      // Upload file to Supabase Storage 'documents' bucket
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return {
          success: false,
          error: `Tải tệp tin thất bại: ${uploadError.message}. Vui lòng chuyển sang phương thức dán Link.`,
        };
      }

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(uploadData.path);

      finalFileUrl = publicUrl;
    } else {
      // Option B: External Link
      if (!externalLink) {
        return {
          success: false,
          error: "Vui lòng nhập đường dẫn (URL) tài liệu.",
        };
      }

      try {
        new URL(externalLink);
      } catch {
        return {
          success: false,
          error:
            "Đường dẫn (URL) không hợp lệ. Vui lòng nhập URL hợp lệ bắt đầu bằng http:// hoặc https://",
        };
      }

      finalFileUrl = externalLink;
      finalFileType = "external_link";
    }

    // --- Insert Record into `posts` Table ---
    const { error: insertError } = await supabase.from("posts").insert({
      title,
      description: description || null,
      subject_id: finalSubjectId,
      author_id: user.id,
      category,
      file_url: finalFileUrl,
      file_type: finalFileType,
      status: "pending", // Awaiting admin moderation
    });

    if (insertError) {
      console.error("Insert post error:", insertError);
      throw insertError;
    }

    revalidatePath("/");
    revalidatePath("/my-posts");

    return {
      success: true,
      message: "Tài liệu đã được gửi thành công và đang chờ Admin duyệt!",
    };
  } catch (err: any) {
    console.error("Lỗi khi tạo tài liệu:", err);
    return {
      success: false,
      error: err.message || "Đã xảy ra lỗi khi tạo tài liệu.",
    };
  }
}

/**
 * Delete a post — only the author can delete their own post.
 */
export async function deletePostAction(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để thực hiện thao tác này.' };
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, author_id, file_url')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return { success: false, error: 'Không tìm thấy bài đăng.' };
    }

    if (post.author_id !== user.id) {
      return { success: false, error: 'Bạn không có quyền xóa bài đăng này.' };
    }

    const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
    if (deleteError) throw deleteError;

    revalidatePath('/my-posts');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xóa bài đăng:', err);
    return { success: false, error: err.message || 'Xóa bài đăng thất bại.' };
  }
}
