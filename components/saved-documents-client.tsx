"use client";

import { useState } from "react";
import Link from "next/link";
import { PostCard, PostItem } from "@/components/post-card";
import {
  Bookmark,
  Search,
  BookOpen,
  FolderHeart,
  ArrowLeft,
  X,
} from "lucide-react";

interface SavedDocumentsClientProps {
  currentUserId: string;
  initialPosts: PostItem[];
}

export function SavedDocumentsClient({
  currentUserId,
  initialPosts,
}: SavedDocumentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.description &&
        post.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.subjects &&
        (post.subjects.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.subjects.code.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categoryPills = [
    { label: `Tất cả (${initialPosts.length})`, value: 'all' },
    { label: 'Đề cương & Bài tập', value: 'Đề thi' },
    { label: 'Slide bài giảng', value: 'Slide bài giảng' },
    { label: 'Bài tập lớn / Đồ án', value: 'Đồ án mẫu' },
    { label: 'Giáo trình & Sách', value: 'Sách/Giáo trình' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về Trang chủ</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-blue-600 rounded-2xl text-white">
        <div className="flex items-center space-x-2 mb-2">
          <Bookmark className="w-4 h-4 fill-white" />
          <span className="text-xs font-medium text-blue-100">Bộ sưu tập cá nhân</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Tài Liệu Đã Lưu
        </h1>
        <p className="text-blue-100 text-sm mt-1 max-w-xl">
          Truy cập nhanh danh sách bài giảng, đề thi và tài liệu bạn đã lưu để ôn tập mọi lúc mọi nơi.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên bài viết, mã môn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          {categoryPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setSelectedCategory(pill.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedCategory === pill.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Saved Posts */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isBookmarked={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {searchQuery || selectedCategory !== "all"
                ? "Không tìm thấy tài liệu phù hợp"
                : "Chưa có tài liệu nào được lưu"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "all"
                ? "Thử thay đổi từ khóa hoặc bộ lọc danh mục để tìm kiếm."
                : "Hãy lưu các đề thi, bài giảng yêu thích để xem lại bất cứ lúc nào."}
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Khám phá tài liệu ngay</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
