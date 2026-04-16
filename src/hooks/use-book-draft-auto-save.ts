"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { saveBookDraft } from "@/app/actions/draft";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseBookDraftAutoSaveOptions {
  title: string;
  description: string;
  genreTags: string;
  chapterTitle: string;
  chapterContent: string;
  /** Debounce delay in ms. Default: 3000 */
  debounceMs?: number;
}

interface UseBookDraftAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  saveNow: () => Promise<void>;
}

export function useBookDraftAutoSave({
  title,
  description,
  genreTags,
  chapterTitle,
  chapterContent,
  debounceMs = 3000,
}: UseBookDraftAutoSaveOptions): UseBookDraftAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const refs = useRef({ title, description, genreTags, chapterTitle, chapterContent });
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    refs.current = { title, description, genreTags, chapterTitle, chapterContent };
  }, [title, description, genreTags, chapterTitle, chapterContent]);

  const performSave = useCallback(async () => {
    const { title, description, genreTags, chapterTitle, chapterContent } = refs.current;
    // Only save if there's something meaningful
    if (!title && !description && !chapterContent) return;

    setSaveStatus("saving");
    try {
      await saveBookDraft({ title, description, genreTags, chapterTitle, chapterContent });
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (err) {
      console.error("[useBookDraftAutoSave] save failed:", err);
      setSaveStatus("error");
    }
  }, []);

  // ── 3-second debounce on any field change ─────────────────────────────────
  useEffect(() => {
    const hasContent = title || description || chapterTitle || chapterContent;
    if (!hasContent) return;

    setSaveStatus("idle");

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(performSave, debounceMs);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [title, description, genreTags, chapterTitle, chapterContent, debounceMs, performSave]);

  // ── Window blur ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleBlur = () => performSave();
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [performSave]);

  // ── beforeunload ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      const payload = JSON.stringify(refs.current);
      // Use a dedicated book-draft beacon endpoint
      navigator.sendBeacon(
        "/api/draft/book",
        new Blob([payload], { type: "application/json" })
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { saveStatus, lastSavedAt, saveNow: performSave };
}
