"use client";

import { useState, useEffect } from "react";
import { createBookWithChapter } from "@/app/actions/write";
import { clearDraftsForNewBook, getBookDraft, getInitialChapterDraft } from "@/app/actions/draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/tiptap-editor";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
import { useBookDraftAutoSave } from "@/hooks/use-book-draft-auto-save";

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
  return null;
}

export default function WriteForm() {
  // Controlled state for all fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genreTags, setGenreTags] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoredAt, setRestoredAt] = useState<Date | null>(null);
  // Gate TipTap mount until draft restore completes
  const [draftLoaded, setDraftLoaded] = useState(false);

  const router = useRouter();

  // ── Restore Drafts on mount ────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      getBookDraft(),
      getInitialChapterDraft()
    ]).then(([metadata, chapter]) => {
      let latestUpdate: Date | null = null;
      let hasAnyContent = false;

      if (metadata) {
        if (metadata.title) setTitle(metadata.title);
        if (metadata.description) setDescription(metadata.description);
        if (metadata.genreTags) setGenreTags(metadata.genreTags);
        
        hasAnyContent = hasAnyContent || !!metadata.title?.trim() || !!metadata.description?.trim() || !!metadata.genreTags?.trim();
        latestUpdate = new Date(metadata.updatedAt);
      }

      if (chapter) {
        if (chapter.title) setChapterTitle(chapter.title);
        if (chapter.content) setChapterContent(chapter.content);

        const hasChContent = !!chapter.title?.trim() || (!!chapter.content && chapter.content.trim() !== "" && chapter.content.trim() !== "<p></p>");
        hasAnyContent = hasAnyContent || hasChContent;

        const chUpdate = new Date(chapter.updatedAt);
        if (!latestUpdate || chUpdate > latestUpdate) {
          latestUpdate = chUpdate;
        }
      }

      // Only show banner if there's something worth restoring
      if (hasAnyContent && latestUpdate) {
        setRestoredAt(latestUpdate);
      }

      // Always unlock TipTap after fetch
      setDraftLoaded(true);
    });
  }, []);

  // ── Auto-save hook ─────────────────────────────────────────────────────────
  const { saveStatus, lastSavedAt } = useBookDraftAutoSave({
    title,
    description,
    genreTags,
    chapterTitle,
    chapterContent,
  });

  const hasContent = !!(title || description || chapterTitle || chapterContent);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("genreTags", genreTags);
    formData.set("chapterTitle", chapterTitle);
    formData.append("content", chapterContent);

    try {
      const result = await createBookWithChapter(formData);
      if (result?.bookId) {
        // Clear both metadata and chapter drafts after successful publish
        await clearDraftsForNewBook();
        router.push(`/book/${result.bookId}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to publish book. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-2xl border border-coffee-100 dark:border-slate-800 shadow-sm">

      {/* Draft restore banner */}
      {restoredAt && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            Restored unsaved draft from{" "}
            <span className="font-semibold">
              {restoredAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover art */}
        <div className="w-full md:w-1/3 flex flex-col space-y-2">
          <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
            Cover Art
          </label>
          <div className="aspect-[2/3] w-full bg-coffee-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-coffee-300 dark:border-slate-700 flex items-center justify-center relative overflow-hidden cursor-pointer hover:border-coffee-500 transition-colors">
            <input
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-coffee-200 dark:bg-slate-700 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl text-coffee-600 dark:text-slate-400">+</span>
                </div>
                <span className="text-xs text-coffee-600 dark:text-slate-400 font-medium">Click or Drag Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Book metadata fields */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <label htmlFor="book-title" className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
              Book Title
            </label>
            {hasContent && <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} />}
          </div>
          <Input
            id="book-title"
            name="title"
            placeholder="The Midnight Library..."
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg bg-coffee-50 dark:bg-slate-950 border-transparent dark:border-slate-800 dark:text-slate-100 focus-visible:ring-coffee-300 dark:focus-visible:ring-slate-600 placeholder:text-coffee-300 dark:placeholder:text-slate-500"
          />

          <div className="space-y-2">
            <label htmlFor="book-description" className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
              Book Description (Synopsis)
            </label>
            <textarea
              id="book-description"
              name="description"
              placeholder="What is your story about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 rounded-md border border-transparent dark:border-slate-800 bg-coffee-50 dark:bg-slate-950 px-3 py-2 text-sm text-coffee-900 dark:text-slate-100 placeholder:text-coffee-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-300 dark:focus-visible:ring-slate-600 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="genre-tags" className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
              Genre & Tags (comma separated)
            </label>
            <Input
              id="genre-tags"
              name="genreTags"
              placeholder="Fantasy, Magic, Adventure"
              value={genreTags}
              onChange={(e) => setGenreTags(e.target.value)}
              className="bg-coffee-50 dark:bg-slate-950 border-transparent dark:border-slate-800 dark:text-slate-100 focus-visible:ring-coffee-300 dark:focus-visible:ring-slate-600 placeholder:text-coffee-300 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Chapter 1 */}
      <div className="border-t border-coffee-200 dark:border-slate-800 pt-8 space-y-6">
        <div className="space-y-2">
          <label htmlFor="chapter-title" className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
            Chapter 1 Title
          </label>
          <Input
            id="chapter-title"
            name="chapterTitle"
            placeholder="Prologue"
            required
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="text-lg bg-coffee-50 dark:bg-slate-950 border-transparent dark:border-slate-800 dark:text-slate-100 focus-visible:ring-coffee-300 dark:focus-visible:ring-slate-600 placeholder:text-coffee-300 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
            Chapter Content
          </label>
          {/* Only mount TipTap after draft restore so it gets correct initial content */}
          {draftLoaded ? (
            <TiptapEditor content={chapterContent} onChange={setChapterContent} />
          ) : (
            <div className="h-[400px] rounded-xl border border-coffee-100 dark:border-slate-800 bg-coffee-50 dark:bg-slate-950 animate-pulse" />
          )}
        </div>
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
          disabled={isPending}
          className="bg-coffee-800 dark:bg-slate-800 hover:bg-coffee-900 dark:hover:bg-slate-700 dark:text-slate-50 px-8"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Publishing…
            </span>
          ) : (
            "Publish Book & Chapter"
          )}
        </Button>
      </div>
    </form>
  );
}
