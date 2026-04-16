"use client";

import { useState, useEffect, useRef } from "react";
import { publishChapter, getDraft, discardDraft } from "@/app/actions/manage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/tiptap-editor";
import { useRouter } from "next/navigation";
import { AlertCircle, FilePlus, CheckCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
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

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-medium">
        <Loader2 className="w-3 h-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CheckCircle className="w-3 h-3" />
        Saved {timeStr && <span className="text-slate-400 font-normal">· {timeStr}</span>}
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
        <AlertTriangle className="w-3 h-3" />
        Save failed
      </span>
    );
  }
  // idle — show "Unsaved changes" only if there's content
  return (
    <span className="flex items-center gap-1.5 text-xs text-coffee-400 dark:text-slate-500 font-medium">
      <Clock className="w-3 h-3" />
      Unsaved changes
    </span>
  );
}

export default function ChapterForm({ bookId, chapterCount = 0 }: { bookId: string; chapterCount?: number }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoredAt, setRestoredAt] = useState<Date | null>(null);
  const [hasContent, setHasContent] = useState(false);
  // editorKey: incrementing it forces TipTap to remount (clears stale content)
  const [editorKey, setEditorKey] = useState(0);
  // draftLoaded controls when TipTap mounts — must wait for draft restore
  // so TipTap receives the correct initial content instead of ""
  const [draftLoaded, setDraftLoaded] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // Live word count — strip HTML tags, split on whitespace
  const wordCount = content
    ? content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length
    : 0;

  // ── Restore draft on mount ─────────────────────────────────────────────────
  useEffect(() => {
    getDraft({ bookId, chapterId: null }).then((draft) => {
      if (draft && !draft.isArchived) {
        const hasTitle = !!draft.title?.trim();
        const hasBody = !!draft.content && draft.content.trim() !== "" && draft.content.trim() !== "<p></p>";

        if (draft.title) setTitle(draft.title);
        if (hasBody) {
          setContent(draft.content);
          setHasContent(true);
        }

        // Only show the banner if there's something worth restoring
        if (hasTitle || hasBody) {
          setRestoredAt(new Date(draft.updatedAt));
        }
      }
      // Always mark as loaded so TipTap mounts with the correct initial value
      setDraftLoaded(true);
    });
  }, [bookId]);

  // ── Auto-save hook ─────────────────────────────────────────────────────────
  const { saveStatus, lastSavedAt } = useAutoSave({
    bookId,
    chapterId: null,
    title,
    content,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("content", content);

    try {
      const result = await publishChapter(bookId, formData);
      if (result?.success) {
        router.refresh();
        // Reset form — incrementing editorKey forces TipTap to remount with empty content
        setTitle("");
        setContent("");
        setHasContent(false);
        setRestoredAt(null);
        setEditorKey((k) => k + 1);
        formRef.current?.reset();
        setIsPending(false);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to publish chapter. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-coffee-100 dark:border-slate-800 shadow-sm mt-8"
    >
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-coffee-200 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <FilePlus className="w-5 h-5 text-coffee-600 dark:text-slate-400" />
          <h3 className="text-xl font-serif font-bold text-coffee-950 dark:text-slate-50">
            Write New Chapter
          </h3>
        </div>
        {/* Save status indicator — only show when there's content */}
        {hasContent && <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} />}
      </div>

      {/* Draft restore banner + discard */}
      {restoredAt && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>
              Restored unsaved draft from{" "}
              <span className="font-semibold">
                {restoredAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await discardDraft(bookId, null);
              setTitle("");
              setContent("");
              setHasContent(false);
              setRestoredAt(null);
              setEditorKey((k) => k + 1);
            }}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 underline underline-offset-2 whitespace-nowrap transition-colors"
          >
            Discard draft
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="chapter-title" className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
          Chapter Title
        </label>
        <Input
          id="chapter-title"
          name="title"
          placeholder={`e.g. Chapter ${chapterCount + 1}: Title`}
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasContent(true);
          }}
          className="text-lg bg-coffee-50 dark:bg-slate-800 border-transparent dark:text-slate-100 focus-visible:ring-coffee-300 dark:focus-visible:ring-slate-600 placeholder:text-coffee-300 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
          Chapter Content
        </label>
        {/* Only mount TipTap after draft is loaded so it gets the correct initial content */}
        {draftLoaded ? (
          <TiptapEditor
            key={editorKey}
            content={content}
            onChange={(val) => {
              setContent(val);
              if (val && val !== "<p></p>") setHasContent(true);
            }}
          />
        ) : (
          <div className="h-[400px] rounded-xl border border-coffee-100 dark:border-slate-800 bg-coffee-50 dark:bg-slate-950 animate-pulse" />
        )}
        {/* Live word count */}
        {wordCount > 0 && (
          <p className="text-right text-xs text-coffee-400 dark:text-slate-500 mt-1">
            {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 justify-center">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="lg"
          disabled={isPending || !content || content.trim() === "" || content === "<p></p>"}
          className="bg-coffee-800 dark:bg-slate-700 hover:bg-coffee-900 dark:hover:bg-slate-600 dark:text-white px-8"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Publishing…
            </span>
          ) : (
            "Publish Chapter"
          )}
        </Button>
      </div>
    </form>
  );
}
