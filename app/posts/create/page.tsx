import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PostCreateForm } from '@/components/post-create-form';

export const metadata = {
  title: 'Đăng tài liệu mới - TLU Tài Liệu',
  description: 'Đóng góp đề thi, slide bài giảng, giáo trình cho cộng đồng sinh viên Đại học Thủy lợi.',
};

export default async function CreatePostPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/posts/create');
  }

  const supabase = await createClient();

  // Fetch dynamic subjects list
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, code, name')
    .order('code', { ascending: true });

  const subjects = subjectsData || [];

  return <PostCreateForm subjects={subjects} />;
}
