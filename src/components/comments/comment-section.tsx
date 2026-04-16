"use client";

import { useState, useTransition } from "react";
import { postComment } from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import CommentItem from "./comment-item";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  bookId: string;
  chapterId: string;
  currentUserId?: string;
  comments: any[]; // The pre-fetched nested tree
}

export default function CommentSection({ bookId, chapterId, currentUserId, comments }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await postComment(bookId, chapterId, content);
      setContent("");
    });
  }

  // Count total comments across all threads
  const countAllComments = (nodes: any[]): number => {
    return nodes.reduce((acc, node) => acc + 1 + countAllComments(node.replies || []), 0);
  };
  const totalComments = countAllComments(comments);

  return (
    <div className="mt-16 pt-12 border-t border-coffee-200" id="comments">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-coffee-600" />
        <h3 className="text-2xl font-serif font-bold text-coffee-950">
          Comments ({totalComments})
        </h3>
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-12 bg-white p-4 md:p-6 rounded-2xl border border-coffee-100 shadow-sm">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are your thoughts on this chapter?"
            className="w-full bg-coffee-50 border border-transparent rounded-xl px-4 py-3 text-coffee-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-300 min-h-[120px] resize-none"
          />
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isPending || !content.trim()} className="bg-coffee-800 hover:bg-coffee-900 px-8">
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-12 bg-coffee-50 p-6 md:p-8 rounded-2xl border border-coffee-100 text-center">
          <h4 className="font-serif font-bold text-lg text-coffee-900 mb-2">Join the discussion</h4>
          <p className="text-coffee-600 mb-6 max-w-md mx-auto">Create an account to share your thoughts and interact with the author.</p>
          <Link href="/login">
            <Button className="bg-coffee-800 hover:bg-coffee-900">Sign in to Comment</Button>
          </Link>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-center text-coffee-500 py-8 italic">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-8">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              bookId={bookId}
              chapterId={chapterId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
