'use client';

import { useState, useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { voteAction } from '@/app/actions/vote';
import { formatRelativeDate } from '@/lib/utils';
import { handleDownload } from '@/lib/download';
import {
  ThumbsUp,
  ThumbsDown,
  Download,
  FileText,
  FileCheck,
  Presentation,
  FolderGit2,
  BookMarked,
  Calendar,
  Share2,
  Check,
} from 'lucide-react';

export interface PostItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  category: string | null;
  created_at: string;
  subjects: {
    id: string;
    code: string;
    name: string;
    faculty: string | null;
  } | null;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  votes: Array<{
    user_id: string;
    vote_type: string | number;
  }> | null;
}

import { BookmarkButton } from '@/components/bookmark-button';

interface PostCardProps {
  post: PostItem;
  currentUserId: string | null;
  isBookmarked?: boolean;
}

const categoryConfig: Record<string, { label: string; icon: any }> = {
  // DB enum values
  'Đề thi': { label: 'Đề thi & Đáp án', icon: FileCheck },
  'Slide bài giảng': { label: 'Slide Bài giảng', icon: Presentation },
  'Đồ án mẫu': { label: 'Bài tập lớn / Đồ án', icon: FolderGit2 },
  'Sách/Giáo trình': { label: 'Giáo trình & Sách', icon: BookMarked },
  // Legacy slug keys
  dethi: { label: 'Đề thi & Đáp án', icon: FileCheck },
  slide: { label: 'Slide Bài giảng', icon: Presentation },
  doan: { label: 'Bài tập lớn / Đồ án', icon: FolderGit2 },
  giaotrinh: { label: 'Giáo trình & Sách', icon: BookMarked },
};

export function PostCard({ post, currentUserId, isBookmarked = false }: PostCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const votesList = post.votes || [];
  const initialUpvotes = votesList.filter(
    (v) => (v.vote_type as any) === 1 || v.vote_type === 'up' || (v.vote_type as any) === '1'
  ).length;
  const initialDownvotes = votesList.filter(
    (v) => (v.vote_type as any) === -1 || v.vote_type === 'down' || (v.vote_type as any) === '-1'
  ).length;

  const rawUserVote = votesList.find((v) => v.user_id === currentUserId)?.vote_type;
  const initialUserVote: 'up' | 'down' | null =
    (rawUserVote as any) === 1 || rawUserVote === 'up' || (rawUserVote as any) === '1'
      ? 'up'
      : (rawUserVote as any) === -1 || rawUserVote === 'down' || (rawUserVote as any) === '-1'
      ? 'down'
      : null;

  // Optimistic UI state for Voting
  const [optimisticState, setOptimisticState] = useOptimistic(
    {
      upvotes: initialUpvotes,
      downvotes: initialDownvotes,
      userVote: initialUserVote,
    },
    (state, actionType: 'up' | 'down') => {
      let { upvotes, downvotes, userVote } = state;

      if (userVote === actionType) {
        if (actionType === 'up') upvotes -= 1;
        if (actionType === 'down') downvotes -= 1;
        userVote = null;
      } else {
        if (userVote === 'up') upvotes -= 1;
        if (userVote === 'down') downvotes -= 1;
        if (actionType === 'up') upvotes += 1;
        if (actionType === 'down') downvotes += 1;
        userVote = actionType;
      }

      return { upvotes, downvotes, userVote };
    }
  );

  const handleVote = (type: 'up' | 'down') => {
    if (!currentUserId) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }

    startTransition(async () => {
      setOptimisticState(type);
      const res = await voteAction(post.id, type);
      if (!res.success && res.error) {
        alert(res.error);
      }
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const catMeta = post.category ? categoryConfig[post.category] : null;
  const CatIcon = catMeta?.icon || FileText;

  return (
    <article className="antigravity-card bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">

      {/* Top Header: Author & Category Badge */}
      <div className="flex items-start justify-between gap-3">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
            {post.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar_url}
                alt={post.author.full_name || 'Author'}
                className="w-full h-full object-cover"
              />
            ) : (
              (post.author?.full_name || 'U')[0].toUpperCase()
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {post.author?.full_name || 'Sinh viên TLU'}
            </h4>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatRelativeDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Category Badge, Bookmark & Share */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {catMeta && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
              <CatIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{catMeta.label}</span>
            </span>
          )}

          <BookmarkButton
            postId={post.id}
            initialIsBookmarked={isBookmarked}
            size="sm"
          />

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Sao chép liên kết bài viết"
          >
            {copied ? <Check className="w-4 h-4 text-blue-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Middle: Subject Tag & Content */}
      <div className="space-y-2">
        {post.subjects && (
          <Link
            href={`/?subject=${post.subjects.id}`}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <span className="font-bold text-blue-600 dark:text-blue-400">{post.subjects.code}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="truncate max-w-[200px] sm:max-w-md">
              {post.subjects.name}
            </span>
          </Link>
        )}

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </h3>

        {post.description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
            {post.description}
          </p>
        )}
      </div>

      {/* Bottom Footer: File Download & Votes */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">

        {/* Left: Vote Action Controls */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('up')}
            disabled={isPending}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              optimisticState.userVote === 'up'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
            title="Đánh giá hữu ích"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{optimisticState.upvotes}</span>
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('down')}
            disabled={isPending}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              optimisticState.userVote === 'down'
                ? 'bg-red-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
            title="Đánh giá không phù hợp"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{optimisticState.downvotes}</span>
          </button>
        </div>

        {/* Right: Actions */}
        {post.file_url && (
          <button
            onClick={() => handleDownload(post.file_url!, post.title)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-medium transition-all cursor-pointer"
            title={`Tải file: ${post.title}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file</span>
          </button>
        )}

      </div>
    </article>
  );
}
