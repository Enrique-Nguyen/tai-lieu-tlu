'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, RotateCcw, Flame, Clock } from 'lucide-react';

interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

interface PostFilterProps {
  subjects: SubjectOption[];
}

export function PostFilter({ subjects }: PostFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Keep state in sync with URL searchParams
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setSubject(searchParams.get('subject') || '');
    setSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filter changes
    params.delete('page');

    router.push(`/?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: q.trim() || null });
  };

  const handleReset = () => {
    setQ('');
    setCategory('');
    setSubject('');
    setSort('newest');
    router.push('/');
  };

  const hasActiveFilters = Boolean(q || category || subject || (sort && sort !== 'newest'));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề bài viết hoặc Mã môn học (ví dụ: INT1234)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer shrink-0"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Filter Selects & Category Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <button
            onClick={() => updateFilters({ category: null })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              !category
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả danh mục
          </button>

          <button
            onClick={() => updateFilters({ category: 'dethi' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              category === 'dethi'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📝 Đề thi & Đáp án
          </button>

          <button
            onClick={() => updateFilters({ category: 'slide' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              category === 'slide'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📊 Slide bài giảng
          </button>

          <button
            onClick={() => updateFilters({ category: 'doan' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              category === 'doan'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            💻 Bài tập lớn & Đồ án
          </button>

          <button
            onClick={() => updateFilters({ category: 'giaotrinh' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              category === 'giaotrinh'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📚 Giáo trình & Sách
          </button>
        </div>

        {/* Dropdowns & Sort Option */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Subject Filter Dropdown */}
          <select
            value={subject}
            onChange={(e) => updateFilters({ subject: e.target.value || null })}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl outline-none"
          >
            <option value="">Lọc theo Môn học...</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                [{sub.code}] {sub.name}
              </option>
            ))}
          </select>

          {/* Sort Order Dropdown */}
          <select
            value={sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl outline-none"
          >
            <option value="newest">🕒 Mới nhất</option>
            <option value="votes">🔥 Đóng góp / Nổi bật nhất</option>
          </select>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Xóa bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
