'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deletePostAction } from '@/app/actions/post';
import { formatRelativeDate } from '@/lib/utils';
import {
  FileText,
  FileCheck,
  Presentation,
  FolderGit2,
  BookMarked,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  Eye,
  Download,
  Plus,
  AlertTriangle,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MyPost {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  category: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
  subjects: { id: string; code: string; name: string; faculty: string | null } | null;
  votes: Array<{ vote_type: string | number }> | null;
  reports_count?: number;
}

interface MyPostsClientProps {
  posts: MyPost[];
  userId: string;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const categoryConfig: Record<string, { label: string; icon: any }> = {
  'Đề thi': { label: 'Đề cương & Bài tập', icon: FileCheck },
  'Slide bài giảng': { label: 'Slide Bài giảng', icon: Presentation },
  'Đồ án mẫu': { label: 'Bài tập lớn / Đồ án', icon: FolderGit2 },
  'Sách/Giáo trình': { label: 'Giáo trình & Sách', icon: BookMarked },
};

const statusConfig = {
  pending: {
    label: 'Chờ duyệt',
    icon: Clock,
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Đã duyệt',
    icon: CheckCircle,
    badge: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Bị từ chối',
    icon: XCircle,
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  flagged: {
    label: 'Bị cắm cờ',
    icon: Flag,
    badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
};

const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
  { key: 'flagged', label: 'Bị cắm cờ' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

// ── Sub-components ─────────────────────────────────────────────────────────────

function DeleteButton({ postId, onDeleted }: { postId: string; onDeleted: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000); // auto-cancel after 3s
      return;
    }
    startTransition(async () => {
      const res = await deletePostAction(postId);
      if (res.success) {
        onDeleted(postId);
      } else {
        alert(res.error || 'Xóa thất bại.');
        setConfirming(false);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-60 ${
        confirming
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
      }`}
      title={confirming ? 'Nhấn lần nữa để xác nhận xóa' : 'Xóa bài đăng'}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {isPending ? 'Đang xóa...' : confirming ? 'Xác nhận xóa?' : 'Xóa'}
    </button>
  );
}

function PostRow({ post, onDeleted }: { post: MyPost; onDeleted: (id: string) => void }) {
  const statusMeta = statusConfig[post.status] ?? statusConfig.pending;
  const StatusIcon = statusMeta.icon;
  const catMeta = post.category ? categoryConfig[post.category] : null;
  const CatIcon = catMeta?.icon ?? FileText;

  const votes = post.votes ?? [];
  const upvotes = votes.filter(
    (v) => (v.vote_type as any) === 1 || v.vote_type === 'up' || (v.vote_type as any) === '1'
  ).length;
  const downvotes = votes.filter(
    (v) => (v.vote_type as any) === -1 || v.vote_type === 'down' || (v.vote_type as any) === '-1'
  ).length;

  const isExternal = post.file_type === 'external_link';

  return (
    <article className="antigravity-card bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusMeta.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
            <StatusIcon className="w-3 h-3" />
            {statusMeta.label}
          </span>

          {/* Category badge */}
          {catMeta && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
              <CatIcon className="w-3 h-3" />
              <span>{catMeta.label}</span>
            </span>
          )}
        </div>

        {/* Date */}
        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
          {formatRelativeDate(post.created_at)}
        </span>
      </div>

      {/* Subject + Title */}
      <div className="space-y-1.5">
        {post.subjects && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-blue-600 dark:text-blue-400">{post.subjects.code}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="truncate max-w-[240px]">{post.subjects.name}</span>
          </div>
        )}
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          <Link
            href={`/post/${post.id}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        {post.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {post.description}
          </p>
        )}
      </div>

      {/* Status-specific notice */}
      {post.status === 'rejected' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Tài liệu này đã bị từ chối bởi quản trị viên. Bạn có thể xóa và đăng lại sau khi chỉnh sửa nội dung cho phù hợp.</span>
        </div>
      )}
      {post.status === 'flagged' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-xs text-orange-700 dark:text-orange-400">
          <Flag className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Tài liệu này đang bị báo cáo và đang được đội ngũ kiểm duyệt xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.</span>
        </div>
      )}
      {post.status === 'pending' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Tài liệu đang chờ đội ngũ kiểm duyệt xem xét. Thời gian duyệt thường từ 24–48 giờ.</span>
        </div>
      )}

      {/* Footer: Stats + Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        {/* Vote stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
            {upvotes}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="w-3.5 h-3.5 text-slate-400" />
            {downvotes}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Xem
          </Link>

          {post.file_url && post.status === 'approved' && (
            isExternal ? (
              <a
                href={post.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở link
              </a>
            ) : (
              <a
                href={`/api/download?url=${encodeURIComponent(post.file_url)}&title=${encodeURIComponent(post.title)}`}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file
              </a>
            )
          )}

          <DeleteButton postId={post.id} onDeleted={onDeleted} />
        </div>
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function MyPostsClient({ posts: initialPosts, userId }: MyPostsClientProps) {
  const [posts, setPosts] = useState<MyPost[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const handleDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  // Stats
  const counts = {
    all: posts.length,
    approved: posts.filter((p) => p.status === 'approved').length,
    pending: posts.filter((p) => p.status === 'pending').length,
    rejected: posts.filter((p) => p.status === 'rejected').length,
    flagged: posts.filter((p) => p.status === 'flagged').length,
  };

  const totalUpvotes = posts.reduce((sum, p) => {
    const votes = p.votes ?? [];
    return (
      sum +
      votes.filter(
        (v) => (v.vote_type as any) === 1 || v.vote_type === 'up' || (v.vote_type as any) === '1'
      ).length
    );
  }, 0);

  const filtered = activeTab === 'all' ? posts : posts.filter((p) => p.status === activeTab);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Bài đăng của tôi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý tất cả tài liệu bạn đã đóng góp cho cộng đồng TLU.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Đăng tài liệu mới
        </Link>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng tài liệu', value: counts.all, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Đã được duyệt', value: counts.approved, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
          { label: 'Chờ duyệt', value: counts.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Tổng upvote', value: totalUpvotes, icon: ThumbsUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const count = counts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Alert: Flagged posts ── */}
      {counts.flagged > 0 && activeTab !== 'flagged' && (
        <button
          onClick={() => setActiveTab('flagged')}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-left hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              {counts.flagged} tài liệu đang bị cắm cờ
            </p>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-0.5">
              Nhấn để xem chi tiết
            </p>
          </div>
        </button>
      )}

      {/* ── Post List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {activeTab === 'all' ? 'Bạn chưa đăng tài liệu nào' : `Không có tài liệu nào trong trạng thái "${tabs.find(t => t.key === activeTab)?.label}"`}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-6">
            {activeTab === 'all'
              ? 'Hãy chia sẻ đề thi, slide bài giảng hoặc giáo trình để giúp đỡ cộng đồng sinh viên TLU!'
              : 'Tất cả tài liệu của bạn ở trạng thái này sẽ xuất hiện ở đây.'}
          </p>
          {activeTab === 'all' && (
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Đăng tài liệu đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <PostRow key={post.id} post={post} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
