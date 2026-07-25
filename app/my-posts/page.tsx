import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/server';
import { MyPostsClient, MyPost } from '@/components/my-posts-client';

export const metadata: Metadata = {
  title: 'Bài đăng của tôi | TLU Tài Liệu',
  description: 'Quản lý tài liệu bạn đã đăng — xem trạng thái chờ duyệt, đã duyệt, bị từ chối và bị cắm cờ.',
};

export default async function MyPostsPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/my-posts');
  }

  const supabase = await createClient();

  const { data: rawPosts } = await supabase
    .from('posts')
    .select(
      `
      id,
      title,
      description,
      file_url,
      file_type,
      category,
      status,
      created_at,
      subjects:subject_id (id, code, name, faculty),
      votes (vote_type)
    `
    )
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  const posts: MyPost[] = (rawPosts ?? []) as unknown as MyPost[];

  return <MyPostsClient posts={posts} userId={user.id} />;
}
