import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserBookmarkIds } from '@/app/actions/bookmark';
import { PostFilter } from '@/components/post-filter';
import { PostCard, PostItem } from '@/components/post-card';
import { Pagination } from '@/components/pagination';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, TrendingUp, FileText, FileQuestion } from 'lucide-react';

const PAGE_SIZE = 3;

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
    faculty?: string;
    department?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || '';
  const category = resolvedParams.category || '';
  const subject = resolvedParams.subject || '';
  const faculty = resolvedParams.faculty || '';
  const department = resolvedParams.department || '';
  const sort = resolvedParams.sort || 'newest';
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10));

  const supabase = await createClient();

  // 1. Build posts query
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
      subjects:subject_id!inner (id, code, name, faculty, department),
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

  if (faculty) {
    query = query.ilike('subjects.faculty', `%${faculty}%`);
  }

  if (department) {
    query = query.ilike('subjects.department', `%${department}%`);
  }

  if (q) {
    // Supabase does not support filtering on joined-table columns inside .or().
    // Solution: pre-query subjects that match the keyword, then use their IDs in the posts filter.
    const { data: matchingSubjects } = await supabase
      .from('subjects')
      .select('id')
      .or(`name.ilike.%${q}%,code.ilike.%${q}%`);

    const matchingSubjectIds = (matchingSubjects || []).map((s) => s.id);

    const orParts = [`title.ilike.%${q}%`, `description.ilike.%${q}%`];
    if (matchingSubjectIds.length > 0) {
      orParts.push(`subject_id.in.(${matchingSubjectIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  // Sorting
  query = query.order('created_at', { ascending: false });

  // Pagination bounds
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  query = query.range(from, to);

  // 2. Fetch User, Subjects, and Posts in PARALLEL
  const [currentUserRes, subjectsRes, postsRes] = await Promise.all([
    getCurrentUser(),
    supabase.from('subjects').select('id, code, name').order('code', { ascending: true }),
    query,
  ]);

  const profile = currentUserRes.profile;
  const currentUserId = profile?.id || null;

  // 3. Fetch bookmarks in parallel if user is logged in
  const userBookmarkIds = currentUserId ? await getUserBookmarkIds(currentUserId) : [];
  const userBookmarkSet = new Set(userBookmarkIds);

  const subjects = subjectsRes.data || [];
  const postsRaw = postsRes.data;
  const count = postsRes.count;

  let posts = (postsRaw as unknown as PostItem[]) || [];

  // If sorting by votes count
  if (sort === 'votes' && posts.length > 0) {
    posts = [...posts].sort((a, b) => {
      const aVotes = (a.votes || []).filter(
        (v) => (v.vote_type as any) === 1 || v.vote_type === 'up' || (v.vote_type as any) === '1'
      ).length;
      const bVotes = (b.votes || []).filter(
        (v) => (v.vote_type as any) === 1 || v.vote_type === 'up' || (v.vote_type as any) === '1'
      ).length;
      return bVotes - aVotes;
    });
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-blue-600 p-6 sm:p-8 text-white overflow-hidden">

        {/* Subtle ambient */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold text-blue-100 border border-white/20">
              <span>Góc Học Tập Sinh Viên Đại Học Thủy Lợi (TLU)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              Kho Tài Liệu Học Tập
              <br className="hidden sm:inline" />
              <span className="text-blue-200">Sinh Viên TLU</span>
            </h1>

            <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
              Tra cứu đề thi, slide bài giảng, giáo trình và bài tập lớn được đóng góp bởi cộng đồng sinh viên Trường Đại học Thủy lợi.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href="/upload"
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Đóng góp tài liệu</span>
              </Link>

              <Link
                href="/?sort=votes"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-lg transition-colors border border-white/20 inline-flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Tài liệu nổi bật</span>
              </Link>
            </div>
          </div>

          {/* Right Branding Card */}
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
            <div className="p-5 rounded-xl bg-white/10 border border-white/15 flex flex-col items-center text-center space-y-3 hover:bg-white/15 transition-colors">
              <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center">
                <Image
                  src="/Logo-DH-Thuy-Loi.webp"
                  alt="Logo Trường Đại Học Thủy Lợi"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-white">ĐẠI HỌC THỦY LỢI</h3>
                <p className="text-xs text-blue-200">Thuyloi University Student Hub</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-xs">
                <div className="bg-white/10 p-2 rounded-lg text-center">
                  <p className="font-bold text-white">{count || 0}+</p>
                  <p className="text-blue-200 text-[10px]">Tài liệu</p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg text-center">
                  <p className="font-bold text-white">10 Khoa</p>
                  <p className="text-blue-200 text-[10px]">Đào tạo</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter and Search Section */}
      <PostFilter subjects={subjects} />

      {/* Posts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Danh sách tài liệu ({count || 0})</span>
          </h2>

          {sort === 'votes' && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sắp xếp theo bình chọn</span>
            </span>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                isBookmarked={userBookmarkSet.has(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 px-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileQuestion className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Chưa tìm thấy tài liệu phù hợp
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
              Không có tài liệu trùng khớp với từ khóa hoặc bộ lọc của bạn.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/upload"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Đăng tài liệu mới
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
