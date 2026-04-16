"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Loader2, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { deleteChapter, reorderChapter } from "@/app/actions/manage";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  chapter: any;
  bookId: string;
  isFirst: boolean;
  isLast: boolean;
}

export default function ChapterListItem({ chapter, bookId, isFirst, isLast }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isReordering, startReorder] = useTransition();
  const router = useRouter();

  if (isDeleted) return null;

  async function confirmDelete() {
    startTransition(async () => {
      setIsModalOpen(false);
      setIsDeleted(true);
      await deleteChapter(chapter.id, bookId);
      router.refresh();
    });
  }

  function handleReorder(direction: "up" | "down") {
    startReorder(async () => {
      await reorderChapter(chapter.id, bookId, direction);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between p-6 hover:bg-coffee-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-3">
          {/* Reorder arrows */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleReorder("up")}
              disabled={isFirst || isReordering}
              className="p-0.5 rounded text-coffee-300 dark:text-slate-600 hover:text-coffee-700 dark:hover:text-slate-300 hover:bg-coffee-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleReorder("down")}
              disabled={isLast || isReordering}
              className="p-0.5 rounded text-coffee-300 dark:text-slate-600 hover:text-coffee-700 dark:hover:text-slate-300 hover:bg-coffee-100 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isReordering && <Loader2 className="w-3 h-3 animate-spin text-coffee-400 dark:text-slate-500" />}
              <span className="font-bold text-coffee-900 dark:text-slate-100">{chapter.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-coffee-400 dark:text-slate-500 font-medium">
              <span>Ch. {chapter.orderIndex + 1}</span>
              <span className="w-1 h-1 rounded-full bg-coffee-300 dark:bg-slate-600" />
              <span>{chapter.wordCount} words</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-coffee-400 dark:text-slate-500 hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-coffee-100 dark:border-slate-800 px-3 py-1.5 rounded-md shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            {new Date(chapter.createdAt).toLocaleDateString()}
          </div>

          <Link href={`/book/${bookId}/manage/edit/${chapter.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-coffee-700 dark:text-slate-300 dark:border-slate-700 dark:bg-transparent hover:bg-coffee-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          </Link>

          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-red-600 dark:text-red-400 dark:border-slate-700 dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
          >
            Delete
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-transparent dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-center text-coffee-950 dark:text-slate-50">Delete Chapter?</h2>
              <p className="text-center text-coffee-600 dark:text-slate-400">
                Are you completely sure you want to permanently delete <span className="font-semibold text-coffee-900 dark:text-slate-200">"{chapter.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="bg-coffee-50 dark:bg-slate-950 p-4 md:p-6 flex items-center justify-center gap-3 border-t border-coffee-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full text-coffee-600 dark:text-slate-300 border-coffee-200 dark:border-slate-700 bg-transparent hover:bg-white dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={confirmDelete}
                disabled={isPending}
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white border-0"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
