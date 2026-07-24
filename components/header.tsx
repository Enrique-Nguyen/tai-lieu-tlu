"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import { UserProfile } from "@/lib/auth";
import { Search, Plus, Menu, X, Sparkles } from "lucide-react";

interface HeaderProps {
  profile: UserProfile | null;
  onToggleMobileSidebar?: () => void;
}

export function Header({ profile, onToggleMobileSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & TLU Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200/80 dark:border-slate-700/80 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 flex items-center justify-center shrink-0">
              <Image
                src="/Logo-DH-Thuy-Loi.webp"
                alt="Logo Đại Học Thủy Lợi"
                width={36}
                height={36}
                className="w-full h-full object-contain drop-shadow-xs"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  Tài liệu{" "}
                  <span className="text-blue-600 dark:text-sky-400">TLU</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-sky-950/80 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-800">
                  HUB
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden md:block -mt-1">
                Đại Học Thủy Lợi
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar with Antigravity Styling */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm môn học, mã môn, đề thi (ví dụ: CSE301, Toán cao cấp)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 focus:border-blue-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-2xl transition-all duration-200 outline-none placeholder:text-slate-400 shadow-xs focus:shadow-md"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </form>
        </div>

        {/* Right: Upload Button & User Navigation */}
        <div className="flex items-center space-x-3">
          <Link
            href="/upload"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Đóng góp tài liệu</span>
            <span className="sm:hidden">Đăng</span>
          </Link>

          <UserNav profile={profile} />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm môn học, đề thi TLU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-xl outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>
    </header>
  );
}
