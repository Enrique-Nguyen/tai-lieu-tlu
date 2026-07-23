import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin-dashboard';

export const metadata = {
  title: 'Admin & Moderator Dashboard - TLU Tài Liệu',
  description: 'Quản trị hệ thống, duyệt bài viết, xử lý báo cáo và phân quyền người dùng.',
};

export default async function AdminPage() {
  const { user, profile } = await getCurrentUser();

  // Security check: Only Admin & Moderator can access /admin
  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/');
  }

  const supabase = await createClient();

  // 1. Fetch pending posts
  const { data: pendingPostsRaw } = await supabase
    .from('posts')
    .select(
      `
      id,
      title,
      description,
      file_url,
      category,
      created_at,
      subjects:subject_id (id, code, name),
      author:author_id (id, full_name, email)
    `
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // 2. Fetch reports
  const { data: reportsRaw } = await supabase
    .from('reports')
    .select(
      `
      id,
      reason,
      created_at,
      posts:post_id (id, title, file_url),
      reporter:reporter_id (id, full_name, email)
    `
    )
    .order('created_at', { ascending: false });

  // 3. Fetch subjects
  const { data: subjectsRaw } = await supabase
    .from('subjects')
    .select('id, code, name, faculty')
    .order('code', { ascending: true });

  // 4. Fetch users (for Admin role management)
  const { data: usersRaw } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url, role, academic_year, major')
    .order('created_at', { ascending: false });

  return (
    <AdminDashboard
      currentUserId={user.id}
      currentUserRole={profile.role}
      pendingPosts={(pendingPostsRaw as any) || []}
      reports={(reportsRaw as any) || []}
      subjects={(subjectsRaw as any) || []}
      usersList={(usersRaw as any) || []}
    />
  );
}
