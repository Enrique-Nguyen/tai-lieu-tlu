import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { PostFilter } from '@/components/post-filter';
import { PostCard, PostItem } from '@/components/post-card';
import { Pagination } from '@/components/pagination';
import Link from 'next/link';
import { BookOpen, Flame, Sparkles, FileText, FileQuestion } from 'lucide-react';

const PAGE_SIZE = 10;

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subject?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const subject = resolvedParams.subject || '';
  const sort = resolvedParams.sort || 'newest';
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));

  const supabase = await createClient();

  // Fetch current user
  const { profile } = await getCurrentUser();
  const currentUserId = profile?.id || null;

  // 1. Fetch subjects list for dropdown filter
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, code, name')
    .order('code', { ascending: true });

  const subjects = subjectsData || [];

  // 2. Build posts query
  let query = supabase
    .from('posts')
    .select(
      `
      id,
      title,
      description,
      file_url,
      category,
      created_at,
      subjects:subject_id (id, code, name, faculty),
      author:author_id (id, full_name, avatar_url),
      votes (user_id, vote_type)
    `,
      { count: 'exact' }
    )
    .eq('status', 'approved');

  if (category) {
    query = query.eq('category', category);
  }

  if (subject) {
    query = query.eq('subject_id', subject);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Sorting
  query = query.order('created_at', { ascending: false });

  // Pagination bounds
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  query = query.range(from, to);

  const { data: postsRaw, count } = await query;

  let posts = (postsRaw as unknown as PostItem[]) || [];

  // If sorting by votes count
  if (sort === 'votes' && posts.length > 0) {
    posts = [...posts].sort((a, b) => {
      const aVotes = (a.votes || []).filter((v) => v.vote_type === 'up').length;
      const bVotes = (b.votes || []).filter((v) => v.vote_type === 'up').length;
      return bVotes - aVotes;
    });
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nền tảng chia sẻ tài liệu TLU</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
            Kho Tài Liệu Học Tập Đại Học Thủy Lợi
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed mb-5">
            Tìm kiếm đề thi, slide bài giảng, giáo trình và đồ án mẫu theo từng môn học. Đóng góp tài liệu để giúp đỡ cộng đồng sinh viên!
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 hover:scale-105 inline-flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Đóng góp tài liệu ngay</span>
            </Link>

            <Link
              href="/?sort=votes"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 border border-white/20 inline-flex items-center space-x-2"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Tài liệu Nổi Bật</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <PostFilter subjects={subjects} />

      {/* Posts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Danh sách Bài viết & Tài liệu ({count || 0})</span>
          </h2>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              Khép lại kết quả tìm kiếm!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại. Bạn có tài liệu môn này? Hãy là người đầu tiên đóng góp cho cộng đồng!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/upload"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Đăng tài liệu mới
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>

    </div>
  );
}
