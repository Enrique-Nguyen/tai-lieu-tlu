'use server';

import { createClient } from '@/lib/server';

export async function createReportAction({
  postId,
  reason,
}: {
  postId: string;
  reason: string;
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
        error: 'Bạn cần đăng nhập để gửi báo cáo vi phạm.',
      };
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return {
        success: false,
        error: 'Vui lòng cung cấp lý do báo cáo.',
      };
    }

    const { error: insertError } = await supabase.from('reports').insert({
      post_id: postId,
      reporter_id: user.id,
      reason: trimmedReason,
      status: 'pending',
    });

    if (insertError) throw insertError;

    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi tạo báo cáo:', err);
    return {
      success: false,
      error: err.message || 'Đã xảy ra lỗi khi gửi báo cáo.',
    };
  }
}
