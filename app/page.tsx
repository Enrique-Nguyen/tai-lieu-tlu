import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { PostFilter } from '@/components/post-filter';
import { PostCard, PostItem } from '@/components/post-card';
import { Pagination } from '@/components/pagination';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Flame, Sparkles, FileText, FileQuestion, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

const PAGE_SIZE = 10;

// Mapping from URL slug -> DB enum value (posts_category_check)
const CATEGORY_SLUG_TO_DB: Record<string, string> = {
  dethi: 'Đề thi',
  slide: 'Slide bài giảng',
  doan: 'Đồ án mẫu',
  giaotrinh: 'Sách/Giáo trình',
};

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
    const dbCategory = CATEGORY_SLUG_TO_DB[category] ?? category;
    query = query.eq('category', dbCategory);
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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Antigravity Glass Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-6 sm:p-10 text-white overflow-hidden shadow-2xl border border-white/10">
        
        {/* Spatial depth ambient lighting */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-xl rounded-full text-xs font-extrabold text-sky-200 border border-white/25 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Góc Học Tập Sinh Viên Đại Học Thủy Lợi (TLU)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Kho Tài Liệu Học Tập <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-amber-200">
                Chính Thức Sinh Viên TLU
              </span>
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              Tra cứu nhanh đề thi, slide bài giảng, giáo trình và bài tập lớn được đóng góp & duyệt chất lượng bởi cộng đồng sinh viên Trường Đại học Thủy lợi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/upload"
                className="px-5 py-2.5 bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center space-x-2 active:scale-95"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Đóng góp tài liệu ngay</span>
              </Link>

              <Link
                href="/?sort=votes"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-bold text-xs sm:text-sm rounded-2xl transition-all duration-200 border border-white/20 inline-flex items-center space-x-2 active:scale-95"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Tài liệu Nổi Bật</span>
              </Link>
            </div>
          </div>

          {/* Right Floating TLU Branding Card */}
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
            <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center text-center space-y-4 hover:scale-105 transition-transform duration-300">
              <div className="w-24 h-24 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center">
                <Image
                  src="/Logo-DH-Thuy-Loi.webp"
                  alt="Logo Trường Đại Học Thủy Lợi"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-sm tracking-tight text-white">ĐẠI HỌC THỦY LỢI</h3>
                <p className="text-[11px] text-blue-200">Thuyloi University Student Hub</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[11px]">
                <div className="bg-white/10 p-2 rounded-xl text-center">
                  <p className="font-extrabold text-amber-300">{count || 0}+</p>
                  <p className="text-[10px] text-blue-200">Tài liệu</p>
                </div>
                <div className="bg-white/10 p-2 rounded-xl text-center">
                  <p className="font-extrabold text-sky-300">10 Khoa</p>
                  <p className="text-[10px] text-blue-200">Đào tạo</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Section */}
      <PostFilter subjects={subjects} />

      {/* Posts Feed */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span>Danh sách Bài viết & Tài liệu ({count || 0})</span>
          </h2>
          
          {sort === 'votes' && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-300/50">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Sắp xếp theo Bình chọn HOT</span>
            </span>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              Chưa tìm thấy tài liệu phù hợp!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Không có tài liệu trùng khớp với từ khóa hoặc bộ lọc của bạn. Bạn có đề thi hay slide môn này? Hãy đăng tải để giúp đỡ cộng đồng nhé!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/upload"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                Đăng tài liệu mới
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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

