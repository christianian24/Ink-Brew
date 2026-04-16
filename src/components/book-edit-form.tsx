"use client";

import { useState, useTransition } from "react";
import { updateBookMetadata } from "@/app/actions/manage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Save, ChevronDown, ChevronUp, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  bookId: string;
  initialTitle: string;
  initialDescription: string;
  initialGenreTags: string;
  initialCoverImage: string | null;
}

export default function BookEditForm({
  bookId, initialTitle, initialDescription, initialGenreTags, initialCoverImage,
}: Props) {
  const [open, setOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState(initialCoverImage || "");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateBookMetadata(bookId, formData);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } catch {
        setStatus("error");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-coffee-200 dark:border-slate-800 shadow-sm mt-8 overflow-hidden">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-coffee-50 dark:bg-slate-950 border-b border-coffee-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between hover:bg-coffee-100 dark:hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-coffee-700 dark:text-slate-400" />
          <h2 className="font-serif font-bold text-lg text-coffee-900 dark:text-slate-100">Edit Book Details</h2>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-coffee-500 dark:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-coffee-500 dark:text-slate-400" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">Title</label>
                <Input
                  name="title"
                  defaultValue={initialTitle}
                  required
                  className="bg-coffee-50 dark:bg-slate-800 border-transparent dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">Description</label>
                <textarea
                  name="description"
                  defaultValue={initialDescription}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-coffee-100 dark:border-slate-700 bg-coffee-50 dark:bg-slate-800 text-coffee-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-coffee-300 dark:focus:ring-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">
                  Genre Tags <span className="font-normal text-coffee-400 dark:text-slate-500">(comma separated)</span>
                </label>
                <Input
                  name="genreTags"
                  defaultValue={initialGenreTags}
                  placeholder="e.g. Fantasy, Romance, Adventure"
                  className="bg-coffee-50 dark:bg-slate-800 border-transparent dark:text-slate-100"
                />
              </div>
            </div>

            {/* Right column — cover */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-coffee-900 dark:text-slate-200 block">Cover Image URL</label>
                <Input
                  name="coverImage"
                  value={coverPreview}
                  onChange={(e) => setCoverPreview(e.target.value)}
                  placeholder="https://…"
                  className="bg-coffee-50 dark:bg-slate-800 border-transparent dark:text-slate-100"
                />
              </div>

              {/* Live preview */}
              <div className="aspect-[2/3] w-40 mx-auto rounded-xl border border-coffee-100 dark:border-slate-700 bg-coffee-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" onError={() => setCoverPreview("")} />
                ) : (
                  <BookOpen className="w-12 h-12 text-coffee-300 dark:text-slate-600" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-coffee-100 dark:border-slate-800">
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 bg-coffee-800 dark:bg-slate-700 hover:bg-coffee-900 dark:hover:bg-slate-600 text-white"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? "Saving…" : "Save Changes"}
            </Button>

            {status === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="w-4 h-4" /> Save failed
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
