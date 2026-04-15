"use client";

import { useState } from "react";
import { createBookWithChapter } from "@/app/actions/write";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TiptapEditor from "@/components/tiptap-editor";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function WriteForm() {
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    formData.append("content", content);

    try {
      const result = await createBookWithChapter(formData);
      if (result && result.bookId) {
        router.push(`/book/${result.bookId}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to publish book. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-10 rounded-2xl border border-coffee-100 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-bold text-coffee-900 block">
            Book Title
          </label>
          <Input 
            id="title" 
            name="title" 
            placeholder="The Midnight Library..." 
            required 
            className="text-lg bg-coffee-50 border-transparent focus-visible:ring-coffee-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold text-coffee-900 block">
            Book Description (Synopsis)
          </label>
          <textarea 
            id="description" 
            name="description" 
            placeholder="What is your story about?" 
            className="w-full h-24 rounded-md border border-transparent bg-coffee-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-300 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="genreTags" className="text-sm font-bold text-coffee-900 block">
            Genre & Tags (comma separated)
          </label>
          <Input 
            id="genreTags" 
            name="genreTags" 
            placeholder="Fantasy, Magic, Adventure" 
            className="bg-coffee-50 border-transparent focus-visible:ring-coffee-300"
          />
        </div>
      </div>

      <div className="border-t border-coffee-200 pt-8 space-y-6">
        <div className="space-y-2">
          <label htmlFor="chapterTitle" className="text-sm font-bold text-coffee-900 block">
            Chapter 1 Title
          </label>
          <Input 
            id="chapterTitle" 
            name="chapterTitle" 
            placeholder="Prologue" 
            required 
            className="text-lg bg-coffee-50 border-transparent focus-visible:ring-coffee-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-coffee-900 block">
            Chapter Content
          </label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 justify-center">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={isPending} className="bg-coffee-800 hover:bg-coffee-900 px-8">
          {isPending ? "Publishing..." : "Publish Book & Chapter"}
        </Button>
      </div>
    </form>
  );
}
