'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addCommentAction, deleteCommentAction } from '@/app/actions/comment';
import { formatRelativeDate } from '@/lib/utils';
import { MessageSquare, Send, Reply, Trash2, Shield, User, CornerDownRight } from 'lucide-react';

export interface CommentItem {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    academic_year: string | null;
    major: string | null;
    student_class: string | null;
    role: string | null;
  } | null;
}

interface CommentSectionProps {
  postId: string;
  comments: CommentItem[];
  currentUserId: string | null;
  currentUserRole: string | null;
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
  currentUserRole,
}: CommentSectionProps) {
  const [mainContent, setMainContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const isAdminOrMod = currentUserRole === 'admin' || currentUserRole === 'moderator';

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  const handleAddComment = (parentId: string | null = null) => {
    if (!currentUserId) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const content = parentId ? replyContent : mainContent;
    if (!content.trim()) return;

    startTransition(async () => {
      setErrorMsg(null);
      const res = await addCommentAction({
        postId,
        content,
        parentId,
      });

      if (res.success) {
        if (parentId) {
          setReplyContent('');
          setReplyingToId(null);
        } else {
          setMainContent('');
        }
      } else {
        setErrorMsg(res.error || 'Gửi bình luận thất bại.');
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    startTransition(async () => {
      const res = await deleteCommentAction({ commentId, postId });
      if (!res.success && res.error) {
        alert(res.error);
      }
    });
  };

  const renderCommentCard = (comment: CommentItem, isReply = false) => {
    const isOwner = currentUserId === comment.author?.id;
    const canDelete = isOwner || isAdminOrMod;

    return (
      <div
        key={comment.id}
        className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors ${
          isReply ? 'ml-4 sm:ml-8 border-l-2 border-l-blue-500' : ''
        }`}
      >
        {/* Comment Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
              {comment.author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.author.avatar_url}
                  alt={comment.author.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                (comment.author?.full_name || 'U')[0].toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {comment.author?.full_name || 'Sinh viên TLU'}
                </span>

                {comment.author?.role === 'admin' && (
                  <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] rounded-md inline-flex items-center">
                    <Shield className="w-2.5 h-2.5 mr-0.5" /> Admin
                  </span>
                )}

                {(comment.author?.academic_year || comment.author?.major) && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({comment.author.academic_year || ''} {comment.author.major ? `• ${comment.author.major}` : ''})
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400">
                {formatRelativeDate(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Action Delete */}
          {canDelete && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              disabled={isPending}
              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Xóa bình luận"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Comment Content */}
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-11 sm:pl-11">
          {comment.content}
        </p>

        {/* Reply Toggle */}
        <div className="pl-11 flex items-center space-x-3 text-xs">
          <button
            onClick={() => {
              if (replyingToId === comment.id) {
                setReplyingToId(null);
              } else {
                setReplyingToId(comment.id);
                setReplyContent('');
              }
            }}
            className="inline-flex items-center space-x-1 font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>{replyingToId === comment.id ? 'Hủy trả lời' : 'Trả lời'}</span>
          </button>
        </div>

        {/* Inline Reply Box */}
        {replyingToId === comment.id && (
          <div className="mt-3 pl-11 space-y-2 animate-in fade-in duration-150">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Trả lời ${comment.author?.full_name || 'sinh viên'}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(comment.id);
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleAddComment(comment.id)}
                disabled={isPending || !replyContent.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Bình luận & Thảo luận ({comments.length})</span>
        </h3>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Main Comment Input Form */}
      {currentUserId ? (
        <div className="space-y-3">
          <textarea
            rows={3}
            placeholder="Viết bình luận hoặc câu hỏi của bạn về tài liệu này..."
            value={mainContent}
            onChange={(e) => setMainContent(e.target.value)}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleAddComment(null)}
              disabled={isPending || !mainContent.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isPending ? 'Đang gửi...' : 'Đăng bình luận'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-center space-y-2">
          <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">
            Bạn cần đăng nhập để tham gia thảo luận và gửi bình luận.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
            className="inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* Comments List Thread */}
      <div className="space-y-4 pt-2">
        {topLevelComments.length > 0 ? (
          topLevelComments.map((topComment) => {
            const replies = getReplies(topComment.id);
            return (
              <div key={topComment.id} className="space-y-2">
                {renderCommentCard(topComment)}
                {replies.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {replies.map((reply) => renderCommentCard(reply, true))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
          </div>
        )}
      </div>

    </div>
  );
}
