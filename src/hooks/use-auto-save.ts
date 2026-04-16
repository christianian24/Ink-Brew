"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { saveDraft } from "@/app/actions/manage";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  bookId: string;
  chapterId: string | null;
  title: string;
  content: string;
  /** Debounce delay in ms. Default: 2000 */
  debounceMs?: number;
  /** Forced interval save in ms. Default: 60000 */
  intervalMs?: number;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  /** Call this manually to trigger an immediate save */
  saveNow: () => Promise<void>;
}

export function useAutoSave({
  bookId,
  chapterId,
  title,
  content,
  debounceMs = 2000,
  intervalMs = 60000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Stable refs so event listeners don't go stale
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const bookIdRef = useRef(bookId);
  const chapterIdRef = useRef(chapterId);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with props
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { bookIdRef.current = bookId; }, [bookId]);
  useEffect(() => { chapterIdRef.current = chapterId; }, [chapterId]);

  const performSave = useCallback(async () => {
    const currentContent = contentRef.current;
    // Don't waste a round-trip on empty content
    if (!currentContent || currentContent.trim() === "" || currentContent === "<p></p>") return;

    setSaveStatus("saving");
    try {
      await saveDraft({
        bookId: bookIdRef.current,
        chapterId: chapterIdRef.current,
        title: titleRef.current,
        content: currentContent,
      });
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (err) {
      console.error("[useAutoSave] save failed:", err);
      setSaveStatus("error");
    }
  }, []);

  // ── Trigger 1: 2-second debounce on content/title change ──────────────────
  useEffect(() => {
    // Don't fire on initial mount with empty content
    if (!content || content === "<p></p>") return;

    // Only mark as unsaved if we're not mid-save
    setSaveStatus((prev) => (prev === "saving" ? prev : "idle"));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [content, title, debounceMs, performSave]);

  // ── Trigger 2: Forced 60-second interval ──────────────────────────────────
  useEffect(() => {
    const intervalId = setInterval(() => {
      performSave();
    }, intervalMs);
    return () => clearInterval(intervalId);
  }, [intervalMs, performSave]);

  // ── Trigger 3: Window blur (user switches tab/app) ─────────────────────────
  useEffect(() => {
    const handleBlur = () => performSave();
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [performSave]);

  // ── Trigger 4: beforeunload → sendBeacon (fire-and-forget) ────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      const payload = JSON.stringify({
        bookId: bookIdRef.current,
        chapterId: chapterIdRef.current,
        title: titleRef.current,
        content: contentRef.current,
      });
      // sendBeacon survives tab close unlike fetch
      navigator.sendBeacon("/api/draft", new Blob([payload], { type: "application/json" }));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { saveStatus, lastSavedAt, saveNow: performSave };
}
