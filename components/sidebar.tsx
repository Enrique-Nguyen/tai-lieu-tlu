"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { FACULTIES_DATA } from "@/lib/constants";
import {
  Computer,
  TrendingUp,
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
  UploadCloud,
  ChevronDown,
  ChevronRight,
  Layers,
  GraduationCap,
  Bookmark,
  Info,
  FileText,
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
  },
  {
    name: "Slide & Bài giảng",
    slug: "slide",
    icon: Presentation,
  },
  {
    name: "Bài tập lớn & Đồ án",
    slug: "doan",
    icon: FolderGit2,
  },
  {
    name: "Giáo trình & Sách",
    slug: "giaotrinh",
    icon: BookMarked,
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
    currentFaculty || null,
  );

  const toggleExpand = (facName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedFaculty((prev) => (prev === facName ? null : facName));
  };

  return (
    <aside className="w-64 shrink-0 p-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] overflow-y-auto space-y-5">
      {/* Brand Mini Badge */}
      <div className="flex items-center space-x-2.5 p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
          <Image
            src="/Logo-DH-Thuy-Loi.webp"
            alt="TLU Logo"
            width={28}
            height={28}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            HAVARD TÂY SƠN
          </span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            <s>Ngôi trường em yêu</s> 💔
          </span>
        </div>
      </div>

      {/* Quick Navigation */}
      <div>
        <h3 className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Khám phá
        </h3>
        <nav className="space-y-0.5">
          <Link
            href="/"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/" &&
              !currentCategory &&
              !currentSort &&
              !currentQ &&
              !currentFaculty &&
              !currentDepartment
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Tất cả tài liệu</span>
          </Link>

          <Link
            href="/saved"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/saved"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className="w-4 h-4 shrink-0" />
            <span>Tài liệu đã lưu</span>
          </Link>

          <Link
            href="/my-posts"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/my-posts"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Bài đăng của tôi</span>
          </Link>

          <Link
            href="/?sort=votes"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSort === "votes"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Tài liệu nổi bật</span>
          </Link>

          <Link
            href="/about"
            onClick={onCloseMobile}
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/about"
                ? "bg-blue-600 text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>Giới thiệu & Hướng dẫn</span>
          </Link>
        </nav>
      </div>

      {/* Category Classification */}
      <div>
        <h3 className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Phân loại tài liệu
        </h3>
        <nav className="space-y-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const href = `/?category=${cat.slug}`;
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={href}
                onClick={onCloseMobile}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-blue-500"}`}
                />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Interactive Faculties & Departments */}
      <div>
        <h3 className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
          <span>Khoa & Bộ môn</span>
          <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
        </h3>

        <div className="space-y-0.5">
          {FACULTIES_DATA.map((fac) => {
            const Icon = facultyIconMap[fac.name] || Layers;
            const isFacultyActive = currentFaculty === fac.name;
            const isExpanded = expandedFaculty === fac.name;

            return (
              <div key={fac.name} className="space-y-0.5">
                {/* Faculty Main Row */}
                <div className="flex items-center">
                  <Link
                    href={`/?faculty=${encodeURIComponent(fac.name)}`}
                    onClick={onCloseMobile}
                    className={`flex-1 flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors truncate ${
                      isFacultyActive
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{fac.name}</span>
                  </Link>

                  {/* Expand/Collapse Toggle */}
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(fac.name, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-1 cursor-pointer"
                    title="Mở rộng danh sách bộ môn"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-blue-500" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Sub-departments List */}
                {isExpanded && (
                  <div className="ml-4 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1 animate-in fade-in duration-150">
                    {fac.departments.map((dept) => {
                      const isDeptActive = currentDepartment === dept;
                      return (
                        <Link
                          key={dept}
                          href={`/?department=${encodeURIComponent(dept)}`}
                          onClick={onCloseMobile}
                          className={`block px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors truncate ${
                            isDeptActive
                              ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {dept}
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

      {/* Contribution CTA */}
      <div className="p-4 rounded-xl bg-blue-600 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <UploadCloud className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold">Bạn có đề thi & slide hay?</p>
        </div>
        <p className="text-[11px] text-blue-100 leading-relaxed mb-3">
          Chia sẻ tài liệu để hỗ trợ sinh viên TLU học tốt hơn!
        </p>
        <Link
          href="/upload"
          onClick={onCloseMobile}
          className="block w-full text-center py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-lg font-semibold text-xs transition-colors"
        >
          Đóng góp ngay
        </Link>
      </div>
    </aside>
  );
}
