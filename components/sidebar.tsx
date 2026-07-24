"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { FACULTIES_DATA } from "@/lib/constants";
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
  Sparkles,
  UploadCloud,
  ChevronDown,
  ChevronRight,
  Layers,
  GraduationCap,
} from "lucide-react";

// Icon mapping for Faculties
const facultyIconMap: Record<string, any> = {
  "Công nghệ Thông tin": Computer,
  "Kinh tế và Quản lý": LineChart,
  "Luật và Lý luận chính trị": Scale,
  "Điện - Điện tử": Cpu,
  "Công trình": HardHat,
  "Kỹ thuật tài nguyên nước": Droplets,
  "Hóa và môi trường": FlaskConical,
  "Cơ khí": Wrench,
  "Kế toán và Kinh doanh": Banknote,
  "Trung tâm đào tạo quốc tế": Globe,
};

const categories = [
  {
    name: "Đề thi & Đáp án",
    slug: "dethi",
    icon: FileCheck,
    color: "text-amber-500",
    bgColor: "group-hover:bg-amber-500/10",
  },
  {
    name: "Slide & Bài giảng",
    slug: "slide",
    icon: Presentation,
    color: "text-blue-500",
    bgColor: "group-hover:bg-blue-500/10",
  },
  {
    name: "Bài tập lớn & Đồ án",
    slug: "doan",
    icon: FolderGit2,
    color: "text-purple-500",
    bgColor: "group-hover:bg-purple-500/10",
  },
  {
    name: "Giáo trình & Sách",
    slug: "giaotrinh",
    icon: BookMarked,
    color: "text-emerald-500",
    bgColor: "group-hover:bg-emerald-500/10",
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort");
  const currentQ = searchParams.get("q");
  const currentFaculty = searchParams.get("faculty");
  const currentDepartment = searchParams.get("department");

  // Track expanded faculty index for accordion UI
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(
    currentFaculty || null
  );

  const toggleExpand = (facName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedFaculty((prev) => (prev === facName ? null : facName));
  };

  return (
    <aside className="w-64 shrink-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
      {/* Brand Mini Badge */}
      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent dark:from-blue-900/30 dark:via-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          <Image
            src="/Logo-DH-Thuy-Loi.webp"
            alt="TLU Logo"
            width={32}
            height={32}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight">
            ĐẠI HỌC THỦY LỢI
          </span>
          <span className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold">
            Góc Sinh Viên TLU
          </span>
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center justify-between">
          <span>Khám phá</span>
          <Sparkles className="w-3 h-3 text-amber-500" />
        </h3>
        <nav className="space-y-1">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              pathname === "/" &&
              !currentCategory &&
              !currentSort &&
              !currentQ &&
              !currentFaculty &&
              !currentDepartment
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
            }`}
          >
            <BookOpen
              className={`w-4 h-4 shrink-0 ${
                pathname === "/" &&
                !currentCategory &&
                !currentSort &&
                !currentQ &&
                !currentFaculty &&
                !currentDepartment
                  ? "text-white"
                  : "text-blue-500"
              }`}
            />
            <span>Tất cả tài liệu</span>
          </Link>

          <Link
            href="/?sort=votes"
            onClick={onCloseMobile}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              currentSort === "votes"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
            }`}
          >
            <Flame
              className={`w-4 h-4 shrink-0 ${
                currentSort === "votes"
                  ? "text-slate-950"
                  : "text-amber-500 animate-bounce"
              }`}
            />
            <span>Tài liệu HOT</span>
            <span
              className={`ml-auto px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                currentSort === "votes"
                  ? "bg-slate-950 text-amber-400"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              TOP
            </span>
          </Link>
        </nav>
      </div>

      {/* Category Classification */}
      <div>
        <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
          Phân loại tài liệu
        </h3>
        <nav className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const href = `/?category=${cat.slug}`;
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={href}
                onClick={onCloseMobile}
                className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${cat.bgColor}`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? pathname === "/" && isActive
                          ? "text-blue-400"
                          : cat.color
                        : cat.color
                    } shrink-0`}
                  />
                </div>
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Interactive Faculties & Departments (Khoa & Bộ môn) */}
      <div>
        <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center justify-between">
          <span>Khoa & Bộ môn học</span>
          <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
        </h3>

        <div className="space-y-1">
          {FACULTIES_DATA.map((fac) => {
            const Icon = facultyIconMap[fac.name] || Layers;
            const isFacultyActive = currentFaculty === fac.name;
            const isExpanded = expandedFaculty === fac.name;

            return (
              <div key={fac.name} className="space-y-1">
                {/* Faculty Main Row */}
                <div className="flex items-center justify-between group">
                  <Link
                    href={`/?faculty=${encodeURIComponent(fac.name)}`}
                    onClick={onCloseMobile}
                    className={`flex-1 flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 truncate ${
                      isFacultyActive
                        ? "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 font-bold border border-blue-200 dark:border-blue-800"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
                    <span className="truncate">{fac.name}</span>
                  </Link>

                  {/* Expand/Collapse Departments Toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(fac.name, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ml-1"
                    title="Mở rộng danh sách bộ môn"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Sub-departments List */}
                {isExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 py-1 animate-in fade-in duration-150">
                    {fac.departments.map((dept) => {
                      const isDeptActive = currentDepartment === dept;
                      return (
                        <Link
                          key={dept}
                          href={`/?department=${encodeURIComponent(dept)}`}
                          onClick={onCloseMobile}
                          className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all truncate ${
                            isDeptActive
                              ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          • {dept}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Tip Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
        <div className="flex items-center space-x-2 mb-2">
          <UploadCloud className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-xs font-bold tracking-tight">
            Bạn có đề thi & slide hay?
          </p>
        </div>
        <p className="text-[11px] text-blue-100 leading-relaxed mb-3">
          Chia sẻ tài liệu để cùng tích lũy điểm thưởng và hỗ trợ sinh viên TLU học tốt hơn!
        </p>
        <Link
          href="/upload"
          onClick={onCloseMobile}
          className="block w-full text-center py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition-all duration-200 active:scale-95"
        >
          Đóng góp ngay
        </Link>
      </div>
    </aside>
  );
}
