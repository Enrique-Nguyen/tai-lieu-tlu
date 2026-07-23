'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import { UserProfile } from '@/lib/auth';
import {
  User,
  FileText,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface UserNavProps {
  profile: UserProfile | null;
}

export function UserNav({ profile }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push('/login');
    router.refresh();
  };

  if (!profile) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
      >
        Đăng nhập
      </Link>
    );
  }

  const roleLabel =
    profile.role === 'admin'
      ? 'Quản trị viên'
      : profile.role === 'moderator'
      ? 'Kiểm duyệt viên'
      : 'Sinh viên';

  const roleBadgeStyle =
    profile.role === 'admin'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
      : profile.role === 'moderator'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'User avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            (profile.full_name || profile.email)[0].toUpperCase()
          )}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
            {profile.full_name || 'Sinh viên'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {profile.full_name || 'Sinh viên'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
              {profile.email}
            </p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${roleBadgeStyle}`}
            >
              {profile.role === 'admin' && <Sparkles className="w-3 h-3 mr-1" />}
              {roleLabel}
            </span>
          </div>

          {/* Menu Options */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Hồ sơ cá nhân</span>
            </Link>

            <Link
              href="/my-posts"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Tài liệu của tôi</span>
            </Link>

            {profile.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-purple-500" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
