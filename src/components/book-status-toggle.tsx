"use client";

import { useState, useTransition } from "react";
import { toggleBookStatus } from "@/app/actions/manage";
import { useRouter } from "next/navigation";
import { Globe, EyeOff, Loader2 } from "lucide-react";

interface Props {
  bookId: string;
  initialStatus: string;
}

export default function BookStatusToggle({ bookId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isPublished = status === "PUBLISHED";

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBookStatus(bookId);
      if (result?.success) {
        setStatus(result.newStatus);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status tag — always visible, clearly shows current state */}
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
          isPublished
            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isPublished ? "bg-emerald-500 dark:bg-emerald-400" : "bg-amber-500 dark:bg-amber-400"
          }`}
        />
        {isPublished ? "Published" : "Draft"}
      </span>

      {/* Action button — clearly labeled as a toggle action */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white dark:bg-slate-900 text-coffee-600 dark:text-slate-400 border-coffee-200 dark:border-slate-700 hover:bg-coffee-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        title={isPublished ? "Click to unpublish" : "Click to publish"}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isPublished ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Globe className="w-3.5 h-3.5" />
        )}
        {isPending ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
