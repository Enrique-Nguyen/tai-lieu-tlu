import { createClient } from '@/lib/server';

export interface BlockStatusResult {
  isBlocked: boolean;
  error?: string;
  status?: 'active' | 'suspended' | 'banned';
  banReason?: string | null;
  suspendedUntil?: string | null;
}

/**
 * Checks if a user is currently banned or suspended.
 * Automatically reinstates user if their temporary suspension has expired.
 */
export async function checkUserBlockStatus(userId: string): Promise<BlockStatusResult> {
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('users')
      .select('status, ban_reason, suspended_until')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return { isBlocked: false, status: 'active' };
    }

    const status = profile.status || 'active';
    const banReason = profile.ban_reason || 'Vi phạm quy định của hệ thống';
    const suspendedUntil = profile.suspended_until || null;

    // 1. Permanent Ban
    if (status === 'banned') {
      return {
        isBlocked: true,
        status: 'banned',
        banReason,
        error: `Tài khoản của bạn đã bị khóa vĩnh viễn do: ${banReason}`,
      };
    }

    // 2. Temporary Suspension
    if (status === 'suspended' && suspendedUntil) {
      const now = new Date();
      const expireTime = new Date(suspendedUntil);

      if (now < expireTime) {
        const formattedDate = expireTime.toLocaleString('vi-VN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        return {
          isBlocked: true,
          status: 'suspended',
          banReason,
          suspendedUntil,
          error: `Tài khoản của bạn bị tạm khóa đến ${formattedDate}. Lý do: ${banReason}`,
        };
      }

      // Expiration time passed -> Auto-reinstate status to active
      await supabase
        .from('users')
        .update({
          status: 'active',
          suspended_until: null,
          ban_reason: null,
        })
        .eq('id', userId);

      return { isBlocked: false, status: 'active' };
    }

    return { isBlocked: false, status: 'active' };
  } catch (error) {
    console.error('Error checking user block status:', error);
    return { isBlocked: false, status: 'active' };
  }
}
