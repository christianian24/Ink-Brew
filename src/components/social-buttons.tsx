"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark } from "lucide-react";
import { toggleLike, toggleBookmark } from "@/app/actions/social";

interface SocialButtonsProps {
  bookId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialLikeCount: number;
  initialBookmarkCount: number;
}

export default function SocialButtons({
  bookId,
  initialLiked,
  initialBookmarked,
  initialLikeCount,
  initialBookmarkCount,
}: SocialButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticLike, addOptimisticLike] = useOptimistic(
    { isLiked: initialLiked, count: initialLikeCount },
    (state, currentLikedState: boolean) => ({
      isLiked: !currentLikedState,
      count: !currentLikedState ? state.count + 1 : state.count - 1,
    })
  );

  const [optimisticBookmark, addOptimisticBookmark] = useOptimistic(
    { isBookmarked: initialBookmarked, count: initialBookmarkCount },
    (state, currentBookmarkedState: boolean) => ({
      isBookmarked: !currentBookmarkedState,
      count: !currentBookmarkedState ? state.count + 1 : state.count - 1,
    })
  );

  return (
    <div className="flex gap-3">
      <form
        action={() => {
          startTransition(async () => {
            addOptimisticLike(optimisticLike.isLiked);
            await toggleLike(bookId);
          });
        }}
        className="flex-1"
      >
        <Button
          variant={optimisticLike.isLiked ? "default" : "outline"}
          className={`w-full gap-2 transition-all ${
            optimisticLike.isLiked
              ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
              : "border-coffee-300 dark:border-slate-700 text-coffee-700 dark:text-slate-300"
          }`}
        >
          <Heart className={`w-4 h-4 ${optimisticLike.isLiked ? "fill-current" : ""}`} />
          {optimisticLike.isLiked ? "Liked" : "Like"} ({optimisticLike.count})
        </Button>
      </form>

      <form
        action={() => {
          startTransition(async () => {
            addOptimisticBookmark(optimisticBookmark.isBookmarked);
            await toggleBookmark(bookId);
          });
        }}
        className="flex-1"
      >
        <Button
          variant={optimisticBookmark.isBookmarked ? "default" : "outline"}
          className={`w-full gap-2 transition-all ${
            optimisticBookmark.isBookmarked
              ? "bg-coffee-800 dark:bg-slate-800 hover:bg-coffee-900 dark:hover:bg-slate-700 text-white dark:text-slate-50 border-coffee-800 dark:border-slate-800"
              : "border-coffee-300 dark:border-slate-700 text-coffee-700 dark:text-slate-300"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${optimisticBookmark.isBookmarked ? "fill-current" : ""}`} />
          {optimisticBookmark.isBookmarked ? "Saved" : "Save"} ({optimisticBookmark.count})
        </Button>
      </form>
    </div>
  );
}
