"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Computer,
  Flame,
  BookOpen,
  FolderGit2,
  FileCheck,
  Presentation,
  BookMarked,
  Globe,
  Cpu,
  LineChart,
  HardHat,
  Droplets,
  Wrench,
  Banknote,
  FlaskConical,
  Scale,
} from "lucide-react";

const faculties = [
  { name: "Công nghệ thông tin", slug: "cntt", icon: Computer },
  { name: "Kinh tế & Quản lý", slug: "kinh-te", icon: LineChart },
  { name: "Luật & Lý luận chính trị", slug: "luat", icon: Scale },
  { name: "Điện - Điện tử", slug: "dien-dien-tu", icon: Cpu },
  { name: "Công trình", slug: "cong-trinh", icon: HardHat },
  { name: "Kỹ thuật tài nguyên nước", slug: "nuoc", icon: Droplets },
  { name: "Hóa & Môi trường", slug: "hoa-mt", icon: FlaskConical },
  { name: "Cơ khí", slug: "co-khi", icon: Wrench },
  { name: "Kế toán & Kinh doanh", slug: "ke-toan", icon: Banknote },
  { name: "Trung tâm đào tạo quốc tế", slug: "quoc-te", icon: Globe },
];

const categories = [
  {
    name: "Đề thi & Đáp án",
    slug: "dethi",
    icon: FileCheck,
    color: "text-amber-500",
  },
  {
    name: "Slide & Bài giảng",
    slug: "slide",
    icon: Presentation,
    color: "text-blue-500",
  },
  {
    name: "Bài tập lớn & Đồ án",
    slug: "doan",
    icon: FolderGit2,
    color: "text-purple-500",
  },
  {
    name: "Giáo trình & Sách",
    slug: "giaotrinh",
    icon: BookMarked,
    color: "text-emerald-500",
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 p-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      {/* Quick Navigation */}
      <div>
        <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Khám phá
        </h3>
        <nav className="space-y-1">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Tất cả môn học</span>
          </Link>

          <Link
            href="/hot"
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/hot"
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <span>Tài liệu Nổi Bật</span>
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 rounded-full">
              HOT
            </span>
          </Link>
        </nav>
      </div>

      {/* Category Classification */}
      <div>
        <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Phân loại tài liệu
        </h3>
        <nav className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const href = `/category/${cat.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={cat.slug}
                href={href}
                onClick={onCloseMobile}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${cat.color} shrink-0`} />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Faculties / Majors List */}
      <div>
        <h3 className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Khoa & Ngành học
        </h3>
        <nav className="space-y-1">
          {faculties.map((fac) => {
            const Icon = fac.icon;
            const href = `/faculty/${fac.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={fac.slug}
                href={href}
                onClick={onCloseMobile}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{fac.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Student Tip Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-800">
        <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">
          💡 Bạn có đề thi hay?
        </p>
        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed mb-3">
          Chia sẻ tài liệu để tích lũy điểm đóng góp cho cộng đồng sinh viên
          TLU.
        </p>
        <Link
          href="/upload"
          onClick={onCloseMobile}
          className="inline-block w-full text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors"
        >
          Đóng góp ngay
        </Link>
      </div>
    </aside>
  );
}
