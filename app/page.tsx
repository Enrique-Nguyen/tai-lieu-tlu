import { createClient } from '@/lib/server';
import Link from 'next/link';
import { BookOpen, FolderOpen, Flame, ArrowRight, Sparkles, FileText } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();

  // Query subjects list directly from Server Component
  const { data: subjects, error } = await supabase
    .from('subjects')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    console.error('Lỗi truy vấn danh sách môn học:', error.message);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nền tảng chia sẻ tài liệu TLU</span>
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
            Kho Tài Liệu Học Tập Đại Học Thủy Lợi
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
            Tìm kiếm đề thi, slide bài giảng, giáo trình và đồ án mẫu theo từng môn học. Đóng góp tài liệu để giúp đỡ cộng đồng sinh viên!
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 inline-flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Đóng góp tài liệu ngay</span>
            </Link>

            <Link
              href="/hot"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm rounded-xl transition-all duration-200 border border-white/20 inline-flex items-center space-x-2"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Xem tài liệu HOT</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Danh Sách Môn Học</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Chọn môn học để xem tất cả tài liệu, đề thi và thảo luận liên quan.
            </p>
          </div>
        </div>

        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subject/${sub.id}`}
                className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs rounded-lg border border-blue-100 dark:border-blue-900/50">
                      {sub.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {sub.faculty || 'Khoa CNTT'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base mb-1">
                    {sub.name}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Xem tài liệu</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              Chưa có dữ liệu môn học
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Hệ thống CSDL hiện tại chưa chứa danh sách môn học. Bạn có thể thêm dữ liệu môn học vào bảng <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600">subjects</code> trong Supabase.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
