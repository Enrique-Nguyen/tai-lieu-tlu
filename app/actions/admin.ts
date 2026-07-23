'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

/**
 * Helper to check if current user is Admin or Moderator
 */
async function checkAdminOrMod() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, profile: null, isAdmin: false, isMod: false };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';
  const isMod = profile?.role === 'moderator';

  return { user, profile, isAdmin, isMod };
}

/**
 * 1. Moderate Post (Approve / Reject)
 */
export async function moderatePostAction({
  postId,
  status,
}: {
  postId: string;
  status: 'approved' | 'rejected';
}) {
  try {
    const { isAdmin, isMod } = await checkAdminOrMod();
    if (!isAdmin && !isMod) {
      return { success: false, error: 'Bạn không có quyền thực hiện thao tác này.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('posts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi duyệt bài:', err);
    return { success: false, error: err.message || 'Duyệt bài thất bại.' };
  }
}

/**
 * 2. Handle Report (Delete Post or Dismiss Report)
 */
export async function handleReportAction({
  reportId,
  postId,
  action,
}: {
  reportId: string;
  postId?: string | null;
  action: 'delete_post' | 'dismiss';
}) {
  try {
    const { isAdmin, isMod } = await checkAdminOrMod();
    if (!isAdmin && !isMod) {
      return { success: false, error: 'Bạn không có quyền thực hiện thao tác này.' };
    }

    const supabase = await createClient();

    if (action === 'delete_post' && postId) {
      // Delete post (this will also delete related reports if configured, or delete report)
      await supabase.from('posts').delete().eq('id', postId);
      await supabase.from('reports').delete().eq('id', reportId);
    } else {
      // Dismiss report
      await supabase.from('reports').delete().eq('id', reportId);
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xử lý báo cáo:', err);
    return { success: false, error: err.message || 'Xử lý báo cáo thất bại.' };
  }
}

/**
 * 3. Create Subject (Admin Only)
 */
export async function createSubjectAction({
  code,
  name,
  faculty,
}: {
  code: string;
  name: string;
  faculty: string;
}) {
  try {
    const { isAdmin } = await checkAdminOrMod();
    if (!isAdmin) {
      return { success: false, error: 'Chỉ Quản trị viên (Admin) mới có quyền tạo môn học.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('subjects').insert({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      faculty: faculty.trim(),
    });

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi thêm môn học:', err);
    return { success: false, error: err.message || 'Thêm môn học thất bại.' };
  }
}

/**
 * 4. Update Subject (Admin Only)
 */
export async function updateSubjectAction({
  id,
  code,
  name,
  faculty,
}: {
  id: string;
  code: string;
  name: string;
  faculty: string;
}) {
  try {
    const { isAdmin } = await checkAdminOrMod();
    if (!isAdmin) {
      return { success: false, error: 'Chỉ Admin mới có quyền cập nhật môn học.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('subjects')
      .update({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        faculty: faculty.trim(),
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi sửa môn học:', err);
    return { success: false, error: err.message || 'Sửa môn học thất bại.' };
  }
}

/**
 * 5. Delete Subject (Admin Only)
 */
export async function deleteSubjectAction(id: string) {
  try {
    const { isAdmin } = await checkAdminOrMod();
    if (!isAdmin) {
      return { success: false, error: 'Chỉ Admin mới có quyền xóa môn học.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('subjects').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xóa môn học:', err);
    return { success: false, error: err.message || 'Xóa môn học thất bại.' };
  }
}

/**
 * 6. Update User Role (Admin Only)
 */
export async function updateUserRoleAction({
  targetUserId,
  newRole,
}: {
  targetUserId: string;
  newRole: 'student' | 'moderator' | 'admin';
}) {
  try {
    const { user, isAdmin } = await checkAdminOrMod();

    if (!isAdmin || !user) {
      return { success: false, error: 'Chỉ Admin mới có quyền phân quyền người dùng.' };
    }

    // Security Rule: Admin cannot change their own role!
    if (targetUserId === user.id) {
      return {
        success: false,
        error: 'Vì lý do bảo mật, bạn không thể tự thay đổi Quyền của chính tài khoản của mình.',
      };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', targetUserId);

    if (error) throw error;

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi thay đổi role:', err);
    return { success: false, error: err.message || 'Phân quyền người dùng thất bại.' };
  }
}
