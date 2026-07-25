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

    // Map 'up' -> 1, 'down' -> -1 for Postgres integer column compatibility
    const voteValue = voteType === 'up' ? 1 : -1;

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (existingVote) {
      const existingValue =
        (existingVote.vote_type as any) === 1 ||
        existingVote.vote_type === 'up' ||
        (existingVote.vote_type as any) === '1'
          ? 1
          : -1;

      if (existingValue === voteValue) {
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
        // Update vote to new type (integer 1 or -1)
        const { error: updateError } = await supabase
          .from('votes')
          .update({ vote_type: voteValue })
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (updateError) throw updateError;

        revalidatePath('/');
        return { success: true, action: 'updated', voteType };
      }
    } else {
      // Insert new vote (integer 1 or -1)
      const { error: insertError } = await supabase.from('votes').insert({
        user_id: user.id,
        post_id: postId,
        vote_type: voteValue,
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
