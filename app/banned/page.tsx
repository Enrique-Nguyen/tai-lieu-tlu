import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AlertOctagon, LogOut, ShieldAlert, Mail } from 'lucide-react';
import { createClient } from '@/lib/server';

export const metadata = {
  title: 'Tài khoản tạm bị khóa - TLU Tài Liệu',
  description: 'Thông báo tài khoản của bạn đã bị khóa do vi phạm quy định của hệ thống.',
};

export default async function BannedPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || profile?.status !== 'banned') {
    redirect('/');
  }

  const banReason =
    profile.ban_reason || 'Tài khoản của bạn đã bị cấm hoạt động do vi phạm quy định của hệ thống.';
  const bannedAtFormatted = profile.banned_at
    ? new Date(profile.banned_at).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  async function handleSignOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 sm:p-8 space-y-6 shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Warning Icon Banner */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertOctagon className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tài Khoản Đã Bị Khóa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tài khoản <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span> tạm thời bị hạn chế quyền truy cập.
          </p>
        </div>

        {/* Ban Reason Box */}
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Lý do khóa tài khoản</span>
          </div>
          <p className="text-sm font-medium text-red-900 dark:text-red-200 leading-relaxed">
            {banReason}
          </p>
          {bannedAtFormatted && (
            <p className="text-[11px] text-red-500 dark:text-red-400 pt-1 border-t border-red-100/60 dark:border-red-900/40">
              Thời gian khóa: {bannedAtFormatted}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Nếu bạn tin rằng đây là sự nhầm lẫn, vui lòng liên hệ Ban quản trị:</span>
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
