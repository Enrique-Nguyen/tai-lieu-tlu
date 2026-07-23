'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function addCommentAction({
  postId,
  content,
  parentId = null,
}: {
  postId: string;
  content: string;
  parentId?: string | null;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Bạn cần đăng nhập để gửi bình luận.',
      };
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return {
        success: false,
        error: 'Nội dung bình luận không được để trống.',
      };
    }

    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: trimmedContent,
      parent_id: parentId || null,
    });

    if (insertError) throw insertError;

    revalidatePath(`/post/${postId}`);
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi gửi bình luận:', err);
    return {
      success: false,
      error: err.message || 'Đã xảy ra lỗi khi đăng bình luận.',
    };
  }
}

export async function deleteCommentAction({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Bạn chưa đăng nhập.',
      };
    }

    // Check user role from DB
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'moderator';

    // Fetch comment to check ownership
    const { data: comment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .single();

    if (!comment) {
      return { success: false, error: 'Bình luận không tồn tại.' };
    }

    if (comment.author_id !== user.id && !isAdminOrMod) {
      return {
        success: false,
        error: 'Bạn không có quyền xóa bình luận này.',
      };
    }

    // Delete comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;

    revalidatePath(`/post/${postId}`);
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xóa bình luận:', err);
    return {
      success: false,
      error: err.message || 'Đã xảy ra lỗi khi xóa bình luận.',
    };
  }
}
