'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FACULTIES_DATA } from '@/lib/constants';
import { Search, RotateCcw, X } from 'lucide-react';

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
  const [faculty, setFaculty] = useState(searchParams.get('faculty') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setSubject(searchParams.get('subject') || '');
    setFaculty(searchParams.get('faculty') || '');
    setDepartment(searchParams.get('department') || '');
    setSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const availableDepartments = faculty
    ? FACULTIES_DATA.find((f) => f.name === faculty)?.departments || []
    : FACULTIES_DATA.flatMap((f) => f.departments);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
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
    setFaculty('');
    setDepartment('');
    setSort('newest');
    router.push('/');
  };

  const hasActiveFilters = Boolean(
    q || category || subject || faculty || department || (sort && sort !== 'newest')
  );

  const categoryPills = [
    { label: 'Tất cả', slug: '' },
    { label: 'Đề thi & Đáp án', slug: 'dethi' },
    { label: 'Slide bài giảng', slug: 'slide' },
    { label: 'Bài tập lớn & Đồ án', slug: 'doan' },
    { label: 'Giáo trình & Sách', slug: 'giaotrinh' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên môn học, mã môn hoặc tiêu đề..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                updateFilters({ q: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer shrink-0"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Category Pills & Dropdowns */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categoryPills.map((pill) => {
            const isActive = category === pill.slug;
            return (
              <button
                key={pill.slug}
                onClick={() => updateFilters({ category: pill.slug || null })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns: Khoa, Bộ Môn, Môn Học & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {/* Khoa Dropdown */}
          <select
            value={faculty}
            onChange={(e) => {
              const val = e.target.value;
              setFaculty(val);
              setDepartment('');
              updateFilters({ faculty: val || null, department: null });
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg outline-none cursor-pointer"
          >
            <option value="">Tất cả Khoa...</option>
            {FACULTIES_DATA.map((fac) => (
              <option key={fac.name} value={fac.name}>
                {fac.name}
              </option>
            ))}
          </select>

          {/* Bộ môn Dropdown */}
          <select
            value={department}
            onChange={(e) => {
              const val = e.target.value;
              setDepartment(val);
              updateFilters({ department: val || null });
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg outline-none cursor-pointer"
          >
            <option value="">Tất cả Bộ môn...</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Subject Filter Dropdown */}
          <select
            value={subject}
            onChange={(e) => updateFilters({ subject: e.target.value || null })}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg outline-none cursor-pointer"
          >
            <option value="">Chọn Môn học...</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                [{sub.code}] {sub.name}
              </option>
            ))}
          </select>

          {/* Sort & Reset */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="votes">Nổi bật nhất</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
