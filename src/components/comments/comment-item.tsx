"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Trash2, CornerDownRight } from "lucide-react";
import { postComment, toggleLikeComment, deleteComment } from "@/app/actions/comments";

export default function CommentItem({ 
  comment, 
  bookId, 
  chapterId, 
  currentUserId 
}: { 
  comment: any;
  bookId: string;
  chapterId: string;
  currentUserId?: string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLiked = comment.likes?.some((like: any) => like.userId === currentUserId);
  const likeCount = comment.likes?.length || 0;
  const isAuthor = currentUserId === comment.userId;
  
  // Create an optimistic UI state flag to hide deleted comments instantly
  const [isDeleted, setIsDeleted] = useState(false);

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;

    startTransition(async () => {
      await postComment(bookId, chapterId, replyText, comment.id);
      setIsReplying(false);
      setReplyText("");
    });
  }

  if (isDeleted) return null;

  return (
    <div className="flex gap-4 group animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="w-10 h-10 rounded-full bg-coffee-200 dark:bg-slate-800 flex items-center justify-center font-serif text-coffee-800 dark:text-slate-200 flex-shrink-0">
        {comment.user.name?.[0]?.toUpperCase() || "U"}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="bg-coffee-50 dark:bg-slate-900 rounded-2xl rounded-tl-none p-4 border border-coffee-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-coffee-900 dark:text-slate-100 text-sm">{comment.user.name}</span>
            <span className="text-xs text-coffee-400 dark:text-slate-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-coffee-800 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-4 px-2 text-xs font-medium text-coffee-500 dark:text-slate-400">
          <form action={() => {
            if (!currentUserId) return; // Prompt auth in a real app
            startTransition(async () => {
              await toggleLikeComment(bookId, chapterId, comment.id);
            });
          }}>
            <button 
              type="submit" 
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </button>
          </form>

          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 hover:text-coffee-950 dark:hover:text-slate-100 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reply
          </button>

          {isAuthor && (
            <button 
              onClick={() => {
                startTransition(async () => {
                  setIsDeleted(true);
                  await deleteComment(bookId, chapterId, comment.id);
                });
              }}
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
        </div>

        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-4 flex gap-3 animate-in slide-in-from-top-2 fade-in">
            <CornerDownRight className="w-5 h-5 text-coffee-300 dark:text-slate-600 mt-2" />
            <div className="flex-1 space-y-2">
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-white dark:bg-slate-950 border border-coffee-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-coffee-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-coffee-300 dark:focus:ring-slate-700 min-h-[80px]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending || !replyText.trim()} className="bg-coffee-800 dark:bg-slate-800 hover:bg-coffee-900 dark:hover:bg-slate-700 dark:text-slate-50">
                  {isPending ? "Posting..." : "Reply"}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Recursive rendering of nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pt-4 border-l-2 border-coffee-100 dark:border-slate-800 pl-4 space-y-6">
            {comment.replies.map((reply: any) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                bookId={bookId} 
                chapterId={chapterId} 
                currentUserId={currentUserId} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
