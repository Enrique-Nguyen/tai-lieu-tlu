'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export async function voteAction(postId: string, voteType: 'up' | 'down') {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Bạn cần đăng nhập để đánh giá bài viết.',
      };
    }

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicked same type (toggle off)
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (deleteError) throw deleteError;

        revalidatePath('/');
        return { success: true, action: 'removed', voteType };
      } else {
        // Update vote to new type
        const { error: updateError } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (updateError) throw updateError;

        revalidatePath('/');
        return { success: true, action: 'updated', voteType };
      }
    } else {
      // Insert new vote
      const { error: insertError } = await supabase.from('votes').insert({
        user_id: user.id,
        post_id: postId,
        vote_type: voteType,
      });

      if (insertError) throw insertError;

      revalidatePath('/');
      return { success: true, action: 'added', voteType };
    }
  } catch (err: any) {
    console.error('Lỗi khi thực hiện voteAction:', err);
    return {
      success: false,
      error: err.message || 'Đã xảy ra lỗi khi thực hiện vote.',
    };
  }
}
