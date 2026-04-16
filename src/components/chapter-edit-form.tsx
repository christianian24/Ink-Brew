"use client";

import { useState, useEffect, useRef } from "react";
import { updateChapter, getDraft } from "@/app/actions/manage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/tiptap-editor";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Loader2, AlertTriangle, Edit3 } from "lucide-react";
import { useAutoSave } from "@/hooks/use-auto-save";

function SaveStatusBadge({
  status,
  lastSavedAt,
}: {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: Date | null;
}) {
  const timeStr = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-medium">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CheckCircle className="w-3 h-3" /> Saved
        {timeStr && <span className="text-slate-400 font-normal">· {timeStr}</span>}
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <AlertTriangle className="w-3 h-3" /> Save failed
      </span>
    );
  return null;
}

interface Props {
  bookId: string;
  chapterId: string;
  initialTitle: string;
  initialContent: string;
}

export default function ChapterEditForm({ bookId, chapterId, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoredAt, setRestoredAt] = useState<Date | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const router = useRouter();

  // Restore in-progress edit draft on mount (chapterId is non-null = editing existing chapter)
  useEffect(() => {
    getDraft({ bookId, chapterId }).then((draft) => {
      if (draft && !draft.isArchived) {
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        setRestoredAt(new Date(draft.updatedAt));
      }
      setDraftLoaded(true);
    });
  }, [bookId, chapterId]);

  const { saveStatus, lastSavedAt } = useAutoSave({ bookId, chapterId, title, content });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.append("content", content);

    try {
      await updateChapter(bookId, chapterId, fd);
      router.push(`/book/${bookId}/manage`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to save changes.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-coffee-100 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-coffee-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Edit3 className="w-5 h-5 text-coffee-600 dark:text-slate-400" />
          <h2 className="text-xl font-serif font-bold text-coffee-950 dark:text-slate-50">Edit Chapter</h2>
        </div>
        <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} />
      </div>

      {/* Draft restore banner */}
      {restoredAt && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            Restored unsaved edit from{" "}
            <span className="font-semibold">
              {restoredAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="edit-title" className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">Chapter Title</label>
        <Input
          id="edit-title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg bg-coffee-50 dark:bg-slate-800 border-transparent dark:text-slate-100 focus-visible:ring-coffee-300 dark:focus-visible:ring-slate-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">Content</label>
        {draftLoaded ? (
          <TiptapEditor content={content} onChange={setContent} />
        ) : (
          <div className="h-[400px] rounded-xl border border-coffee-100 dark:border-slate-800 bg-coffee-50 dark:bg-slate-950 animate-pulse" />
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 text-sm">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}
          className="border-coffee-200 dark:border-slate-700 text-coffee-700 dark:text-slate-300 dark:bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="bg-coffee-800 dark:bg-slate-700 hover:bg-coffee-900 dark:hover:bg-slate-600 dark:text-white px-8">
          {isPending ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving…</span> : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
