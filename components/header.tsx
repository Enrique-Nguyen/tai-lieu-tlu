"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import { UserProfile } from "@/lib/auth";
import { createClient } from "@/lib/client";
import { Search, Plus, Menu, X, Bookmark, BookOpen, ArrowRight } from "lucide-react";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface HeaderProps {
  profile: UserProfile | null;
  onToggleMobileSidebar?: () => void;
}

export function Header({ profile, onToggleMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isOpenDesktop, setIsOpenDesktop] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  // Sync searchQuery with URL params
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Fetch subject list for search suggestions
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("subjects")
          .select("id, code, name")
          .order("code", { ascending: true });
        if (data) {
          setSubjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch subjects for header search:", err);
      }
    };
    fetchSubjects();
  }, []);

  // Handle click outside search containers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node)
      ) {
        setIsOpenDesktop(false);
      }
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setIsOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard Shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        desktopInputRef.current?.focus();
        setIsOpenDesktop(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const trimmedQ = searchQuery.trim().toLowerCase();
  const matchingSubjectSuggestions =
    trimmedQ && subjects.length > 0
      ? subjects
          .filter(
            (sub) =>
              sub.name.toLowerCase().includes(trimmedQ) ||
              sub.code.toLowerCase().includes(trimmedQ)
          )
          .slice(0, 6)
      : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpenDesktop(false);
    setIsOpenMobile(false);
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  const handleSelectSuggestion = (subName: string) => {
    setSearchQuery(subName);
    setIsOpenDesktop(false);
    setIsOpenMobile(false);
    router.push(`/?q=${encodeURIComponent(subName)}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsOpenDesktop(false);
    setIsOpenMobile(false);
    router.push("/");
  };

  const renderSuggestions = (onClose: () => void) => {
    if (!trimmedQ || matchingSubjectSuggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in slide-in-from-top-1 duration-150">
        <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            Gợi ý môn học ({matchingSubjectSuggestions.length})
          </span>
          <span>Nhấn để tìm</span>
        </div>

        <div className="py-1">
          {matchingSubjectSuggestions.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSelectSuggestion(sub.name)}
              className="w-full text-left px-3.5 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center justify-between group transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                  {sub.code}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {sub.name}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            if (searchQuery.trim()) {
              router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          className="w-full text-left px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Tìm từ khóa &quot;{searchQuery.trim()}&quot;</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & TLU Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative w-9 h-9 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200/80 dark:border-slate-700/80 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all duration-200 flex items-center justify-center shrink-0">
              <Image
                src="/Logo-DH-Thuy-Loi.webp"
                alt="Logo Đại Học Thủy Lợi"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Tài liệu{" "}
                  <span className="text-blue-600 dark:text-blue-400">TLU</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  HUB
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden md:block -mt-0.5">
                Đại Học Thủy Lợi
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar with Autocomplete Suggestions */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div ref={desktopSearchRef} className="relative group">
            <form onSubmit={handleSearch}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={desktopInputRef}
                type="text"
                placeholder="Tìm môn học, mã môn, đề thi (ví dụ: CSE301, Toán cao cấp)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpenDesktop(true);
                }}
                onFocus={() => setIsOpenDesktop(true)}
                className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm rounded-lg transition-all duration-200 outline-none placeholder:text-slate-400"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </form>
            {isOpenDesktop && renderSuggestions(() => setIsOpenDesktop(false))}
          </div>
        </div>

        {/* Right: Saved, Upload & User Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {profile && (
            <Link
              href="/saved"
              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              title="Tài liệu đã lưu"
            >
              <Bookmark className="w-5 h-5" />
            </Link>
          )}

          <Link
            href="/upload"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Đóng góp tài liệu</span>
            <span className="sm:hidden">Đăng</span>
          </Link>

          <UserNav profile={profile} />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 md:hidden">
        <div ref={mobileSearchRef} className="relative">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm môn học, đề thi TLU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpenMobile(true);
              }}
              onFocus={() => setIsOpenMobile(true)}
              className="w-full pl-10 pr-9 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
          {isOpenMobile && renderSuggestions(() => setIsOpenMobile(false))}
        </div>
      </div>
    </header>
  );
}
