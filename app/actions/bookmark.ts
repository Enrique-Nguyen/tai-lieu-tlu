"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function toggleBookmarkAction({ postId }: { postId: string }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        isBookmarked: false,
        error: "Bạn cần đăng nhập để lưu tài liệu.",
      };
    }

    // Check if post is already bookmarked
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (existing) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);

      if (deleteError) throw deleteError;

      revalidatePath("/saved");
      revalidatePath(`/post/${postId}`);
      revalidatePath("/");

      return {
        success: true,
        isBookmarked: false,
        message: "Đã bỏ lưu tài liệu khỏi danh sách ưa thích.",
      };
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from("bookmarks")
        .insert({
          user_id: user.id,
          post_id: postId,
        });

      if (insertError) throw insertError;

      revalidatePath("/saved");
      revalidatePath(`/post/${postId}`);
      revalidatePath("/");

      return {
        success: true,
        isBookmarked: true,
        message: "Đã lưu tài liệu vào danh sách ưa thích!",
      };
    }
  } catch (err: any) {
    console.error("Error toggling bookmark:", err);
    return {
      success: false,
      isBookmarked: false,
      error: err.message || "Đã xảy ra lỗi khi lưu tài liệu.",
    };
  }
}

/**
 * Fetch array of bookmarked post_ids for current authenticated user
 */
export async function getUserBookmarkIds(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", user.id);

    return data ? data.map((b) => b.post_id) : [];
  } catch (err) {
    console.error("Error getting user bookmark IDs:", err);
    return [];
  }
}
