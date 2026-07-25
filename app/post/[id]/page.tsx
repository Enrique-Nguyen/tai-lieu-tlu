import { createClient } from '@/lib/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserBookmarkIds } from '@/app/actions/bookmark';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PostCard, PostItem } from '@/components/post-card';
import { FileViewer } from '@/components/file-viewer';
import { ReportModal } from '@/components/report-modal';
import { CommentSection, CommentItem } from '@/components/comment-section';
import { ChevronRight, Home, BookOpen, ArrowLeft } from 'lucide-react';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('title, description')
    .eq('id', resolvedParams.id)
    .single();

  if (!post) return { title: 'Tài liệu không tồn tại - TLU' };

  return {
    title: `${post.title} - TLU Tài Liệu`,
    description: post.description || 'Chi tiết bài viết tài liệu sinh viên Thủy lợi',
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  const supabase = await createClient();

  // Run user, post, and comments queries in PARALLEL
  const [userRes, postRes, commentsRes] = await Promise.all([
    getCurrentUser(),
    supabase
      .from('posts')
      .select(
        `
        id,
        title,
        description,
        file_url,
        category,
        created_at,
        status,
        subjects:subject_id (id, code, name, faculty),
        author:author_id (id, full_name, avatar_url),
        votes (user_id, vote_type)
      `
      )
      .eq('id', postId)
      .single(),
    supabase
      .from('comments')
      .select(
        `
        id,
        content,
        created_at,
        parent_id,
        author:author_id (
          id,
          full_name,
          avatar_url,
          academic_year,
          major,
          student_class,
          role
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true }),
  ]);

  const profile = userRes.profile;
  const currentUserId = profile?.id || null;
  const currentUserRole = profile?.role || null;

  const postRaw = postRes.data;
  const postError = postRes.error;

  if (postError || !postRaw) {
    notFound();
  }

  const post = postRaw as unknown as PostItem;

  // Check visibility (must be approved, or owned by user, or admin)
  if (
    postRaw.status !== 'approved' &&
    currentUserId !== post.author?.id &&
    currentUserRole !== 'admin'
  ) {
    notFound();
  }

  // Fetch bookmark status for current user
  const userBookmarkIds = currentUserId ? await getUserBookmarkIds(currentUserId) : [];
  const isBookmarked = userBookmarkIds.includes(post.id);

  const comments = (commentsRes.data as unknown as CommentItem[]) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 overflow-x-auto pb-1 no-scrollbar">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {post.subjects ? (
          <Link
            href={`/?subject=${post.subjects.id}`}
            className="hover:text-blue-600 flex items-center gap-1 transition-colors shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>[{post.subjects.code}] {post.subjects.name}</span>
          </Link>
        ) : (
          <span>Tài liệu</span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[200px]">
          {post.title}
        </span>
      </nav>

      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Main Post Header Card */}
      <PostCard post={post} currentUserId={currentUserId} isBookmarked={isBookmarked} />

      {/* Report Button Row */}
      <div className="flex justify-end">
        <ReportModal postId={post.id} currentUserId={currentUserId} />
      </div>

      {/* Attached File Preview / PDF Viewer */}
      {post.file_url && <FileViewer fileUrl={post.file_url} title={post.title} />}

      {/* Comment Section Component */}
      <CommentSection
        postId={post.id}
        comments={comments}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

    </div>
  );
}
