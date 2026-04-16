"use client";

import { useState, useTransition } from "react";
import { followAuthor, unfollowAuthor } from "@/app/actions/social";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  authorId: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
}

export default function FollowButton({ authorId, initialIsFollowing, initialFollowerCount }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      if (isFollowing) {
        await unfollowAuthor(authorId);
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await followAuthor(authorId);
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-coffee-500 dark:text-slate-400">
        <span className="font-bold text-coffee-900 dark:text-slate-100">{followerCount}</span>{" "}
        {followerCount === 1 ? "follower" : "followers"}
      </span>
      <Button
        onClick={handleToggle}
        disabled={isPending}
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        className={isFollowing
          ? "gap-2 border-coffee-300 dark:border-slate-600 text-coffee-700 dark:text-slate-300 bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors"
          : "gap-2 bg-coffee-800 dark:bg-slate-700 hover:bg-coffee-900 dark:hover:bg-slate-600 text-white"
        }
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isFollowing ? (
          <><UserCheck className="w-4 h-4" /> Following</>
        ) : (
          <><UserPlus className="w-4 h-4" /> Follow</>
        )}
      </Button>
    </div>
  );
}
