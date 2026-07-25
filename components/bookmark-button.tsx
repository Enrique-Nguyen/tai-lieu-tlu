"use client";

import { useState, useOptimistic, useTransition } from "react";
import { toggleBookmarkAction } from "@/app/actions/bookmark";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked?: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function BookmarkButton({
  postId,
  initialIsBookmarked = false,
  size = "md",
  showText = false,
  className = "",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const [optimisticIsBookmarked, setOptimisticIsBookmarked] = useOptimistic(
    isBookmarked,
    (current, nextState: boolean) => nextState
  );

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !optimisticIsBookmarked;

    startTransition(async () => {
      setOptimisticIsBookmarked(nextState);
      const res = await toggleBookmarkAction({ postId });

      if (res.success) {
        setIsBookmarked(res.isBookmarked);
      } else {
        setOptimisticIsBookmarked(isBookmarked);
        if (res.error) {
          alert(res.error);
        }
      }
    });
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const btnPadding = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-xs sm:text-sm",
    lg: "px-4 py-2.5 text-sm",
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={optimisticIsBookmarked ? "Bỏ lưu tài liệu" : "Lưu tài liệu ưa thích"}
      className={`inline-flex items-center space-x-1.5 rounded-lg font-medium transition-all duration-200 active:scale-90 cursor-pointer ${
        optimisticIsBookmarked
          ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
      } ${btnPadding[size]} ${className}`}
    >
      <Bookmark
        className={`${iconSizes[size]} transition-all ${
          optimisticIsBookmarked
            ? "fill-blue-500 text-blue-500"
            : "text-slate-400"
        }`}
      />
      {showText && (
        <span>
          {optimisticIsBookmarked ? "Đã lưu" : "Lưu tài liệu"}
        </span>
      )}
    </button>
  );
}
