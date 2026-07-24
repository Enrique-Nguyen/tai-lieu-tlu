'use client';

import { useState, useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { voteAction } from '@/app/actions/vote';
import { formatRelativeDate } from '@/lib/utils';
import {
  ThumbsUp,
  ThumbsDown,
  Download,
  FileText,
  FileCheck,
  Presentation,
  FolderGit2,
  BookMarked,
  User,
  Calendar,
  ExternalLink,
  Share2,
  Check,
  Eye,
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
    vote_type: string;
  }> | null;
}

interface PostCardProps {
  post: PostItem;
  currentUserId: string | null;
}

const categoryConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  // DB enum values (posts_category_check constraint)
  'Đề thi': { label: 'Đề thi & Đáp án', bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-300', icon: FileCheck },
  'Slide bài giảng': { label: 'Slide Bài giảng', bg: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-300', icon: Presentation },
  'Đồ án mẫu': { label: 'Bài tập lớn / Đồ án', bg: 'bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-900', text: 'text-purple-700 dark:text-purple-300', icon: FolderGit2 },
  'Sách/Giáo trình': { label: 'Giáo trình & Sách', bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', icon: BookMarked },
  // Legacy slug keys (backward-compatible for any old records)
  dethi: { label: 'Đề thi & Đáp án', bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-300', icon: FileCheck },
  slide: { label: 'Slide Bài giảng', bg: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900', text: 'text-blue-700 dark:text-blue-300', icon: Presentation },
  doan: { label: 'Bài tập lớn / Đồ án', bg: 'bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-900', text: 'text-purple-700 dark:text-purple-300', icon: FolderGit2 },
  giaotrinh: { label: 'Giáo trình & Sách', bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-300', icon: BookMarked },
};

export function PostCard({ post, currentUserId }: PostCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const votesList = post.votes || [];
  const initialUpvotes = votesList.filter((v) => v.vote_type === 'up').length;
  const initialDownvotes = votesList.filter((v) => v.vote_type === 'down').length;
  const initialUserVote = votesList.find((v) => v.user_id === currentUserId)?.vote_type || null;

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
        // Toggle off
        if (actionType === 'up') upvotes -= 1;
        if (actionType === 'down') downvotes -= 1;
        userVote = null;
      } else {
        // Switch or new vote
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
    <article className="antigravity-card bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 relative group">
      
      {/* Top Header: Author & Category Badge */}
      <div className="flex items-start justify-between gap-3">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs">
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
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {post.author?.full_name || 'Sinh viên TLU'}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatRelativeDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Category Badge & Share Button */}
        <div className="flex items-center space-x-2 shrink-0">
          {catMeta && (
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catMeta.bg} ${catMeta.text}`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{catMeta.label}</span>
            </span>
          )}

          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Sao chép liên kết bài viết"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Middle: Subject Tag & Content */}
      <div className="space-y-2.5">
        {post.subjects && (
          <Link
            href={`/?subject=${post.subjects.id}`}
            className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-xs font-extrabold text-blue-700 dark:text-sky-300 border border-blue-200/80 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
          >
            <span>{post.subjects.code}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="truncate max-w-[200px] sm:max-w-md font-semibold">
              {post.subjects.name}
            </span>
          </Link>
        )}

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-sky-400 transition-colors leading-snug">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </h3>

        {post.description && (
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal">
            {post.description}
          </p>
        )}
      </div>

      {/* Bottom Footer: File Download & Votes */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left: Vote Action Controls */}
        <div className="flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('up')}
            disabled={isPending}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              optimisticState.userVote === 'up'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Đánh giá hữu ích"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{optimisticState.upvotes}</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('down')}
            disabled={isPending}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              optimisticState.userVote === 'down'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Đánh giá không phù hợp"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{optimisticState.downvotes}</span>
          </button>
        </div>

        {/* Right: Actions (View Detail & Download) */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem chi tiết</span>
          </Link>

          {post.file_url && (
            <a
              href={post.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file</span>
            </a>
          )}
        </div>

      </div>
    </article>
  );
}

