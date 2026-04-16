"use client";

import { useState, useTransition } from "react";
import { toggleWantToRead } from "@/app/actions/social";
import { BookmarkPlus, BookmarkCheck, Loader2 } from "lucide-react";

interface Props {
  bookId: string;
  initialWantToRead: boolean;
}

export default function WantToReadButton({ bookId, initialWantToRead }: Props) {
  const [isWantToRead, setIsWantToRead] = useState(initialWantToRead);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleWantToRead(bookId);
      if (result?.success) setIsWantToRead(result.added);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
        isWantToRead
          ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/50 hover:bg-violet-100 dark:hover:bg-violet-950/60"
          : "bg-white dark:bg-slate-900 text-coffee-700 dark:text-slate-300 border-coffee-200 dark:border-slate-700 hover:bg-coffee-50 dark:hover:bg-slate-800"
      } disabled:opacity-60`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isWantToRead ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <BookmarkPlus className="w-4 h-4" />
      )}
      {isWantToRead ? "On Reading List" : "Add to Reading List"}
    </button>
  );
}
