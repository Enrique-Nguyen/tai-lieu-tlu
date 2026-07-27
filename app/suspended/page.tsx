import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Clock, LogOut, ShieldAlert, Mail } from 'lucide-react';
import { createClient } from '@/lib/server';

export const metadata = {
  title: 'Tài khoản bị tạm khóa - TLU Tài Liệu',
  description: 'Thông báo tài khoản của bạn tạm thời bị hạn chế quyền truy cập.',
};

export default async function SuspendedPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || profile?.status !== 'suspended') {
    redirect('/');
  }

  // Check if suspension has expired
  if (profile.suspended_until) {
    const now = new Date();
    const expireTime = new Date(profile.suspended_until);

    if (now >= expireTime) {
      redirect('/');
    }
  }

  const banReason =
    profile.ban_reason || 'Tài khoản của bạn tạm thời bị hạn chế hoạt động do vi phạm quy định.';
  const suspendedUntilFormatted = profile.suspended_until
    ? new Date(profile.suspended_until).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Chưa xác định';

  async function handleSignOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 sm:p-8 space-y-6 shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Warning Icon Banner */}
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tài Khoản Bị Tạm Khóa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tài khoản <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span> tạm thời bị hạn chế quyền sử dụng.
          </p>
        </div>

        {/* Suspended Info Box */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Thông tin tạm khóa</span>
          </div>

          <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
            <p>
              <strong>Thời hạn tạm khóa đến:</strong>
            </p>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              {suspendedUntilFormatted}
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 space-y-1 text-xs text-amber-900 dark:text-amber-200">
            <p>
              <strong>Lý do tạm khóa:</strong>
            </p>
            <p className="leading-relaxed text-slate-800 dark:text-slate-200">
              {banReason}
            </p>
          </div>
        </div>

        {/* Contact info */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Nếu có thắc mắc hoặc cần khiếu nại, vui lòng liên hệ:</span>
          </p>
          <a
            href="mailto:admin@tlu.edu.vn"
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline inline-block"
          >
            admin@tlu.edu.vn
          </a>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
