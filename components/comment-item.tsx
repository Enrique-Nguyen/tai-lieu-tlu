'use client';

import { useState } from 'react';
import { deleteComment } from '@/app/actions/comment';
import { formatRelativeDate } from '@/lib/utils';
import { Trash2, Shield } from 'lucide-react';

export interface CommentAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  academic_year?: string | null;
  major?: string | null;
  student_class?: string | null;
  role?: string | null;
}

export interface CommentData {
  id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  author_id?: string;
  author?: CommentAuthor | null;
}

export interface CommentUser {
  id: string;
  role?: string | null;
}

interface CommentItemProps {
  comment: CommentData;
  currentUser?: CommentUser | null;
  postId: string;
  isReply?: boolean;
  onReplyClick?: (commentId: string) => void;
  isReplying?: boolean;
}

export function CommentItem({
  comment,
  currentUser,
  postId,
  isReply = false,
  onReplyClick,
  isReplying = false,
}: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Check Delete Permissions: Author OR (Admin / Moderator)
  const commentAuthorId = comment.author_id || comment.author?.id;
  const isAuthor = Boolean(currentUser?.id && currentUser.id === commentAuthorId);
  const isAdminOrMod = Boolean(
    currentUser?.role && ['admin', 'moderator'].includes(currentUser.role)
  );
  const canDelete = isAuthor || isAdminOrMod;

  // 2. Handle Delete with Confirm Popup & Server Action
  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    setIsDeleting(true);
    try {
      const res = await deleteComment(comment.id, postId);
      if (res?.error) {
        alert(res.error);
        setIsDeleting(false);
      }
    } catch (err: any) {
      alert(err?.message || 'Đã xảy ra lỗi khi xóa bình luận.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 transition-all ${
        isReply ? 'ml-4 sm:ml-8 border-l-2 border-l-blue-500' : ''
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Header Row: Author Info & Delete Button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
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
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-md inline-flex items-center">
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

        {/* Delete Button (Only shown when user has permission) */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            title="Xóa bình luận"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-11 sm:pl-11">
        {comment.content}
      </p>

      {/* Reply Action Link */}
      {onReplyClick && (
        <div className="pl-11 flex items-center space-x-3 text-xs">
          <button
            onClick={() => onReplyClick(comment.id)}
            className="inline-flex items-center space-x-1 font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span>{isReplying ? 'Hủy trả lời' : 'Trả lời'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
