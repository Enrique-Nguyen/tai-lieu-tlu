import { createClient } from "@/lib/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SavedDocumentsClient } from "@/components/saved-documents-client";
import { PostItem } from "@/components/post-card";

export const metadata = {
  title: "Tài liệu đã lưu - TLU Tài Liệu",
  description: "Danh sách đề thi, bài giảng và tài liệu bạn đã lưu ưa thích.",
};

export default async function SavedPage() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/saved");
  }

  const supabase = await createClient();

  // Query bookmarks joined with posts
  const { data: bookmarksRaw } = await supabase
    .from("bookmarks")
    .select(
      `
      post_id,
      created_at,
      posts:post_id (
        id,
        title,
        description,
        file_url,
        category,
        created_at,
        subjects:subject_id (id, code, name, faculty),
        author:author_id (id, full_name, avatar_url),
        votes (user_id, vote_type)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Map raw data to PostItem array
  const savedPosts: PostItem[] = (bookmarksRaw || [])
    .map((b: any) => b.posts)
    .filter((p: any) => p !== null);

  return (
    <SavedDocumentsClient
      currentUserId={user.id}
      initialPosts={savedPosts}
    />
  );
}
