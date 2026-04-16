"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notifyOnComment } from "@/app/actions/notifications";

export async function postComment(bookId: string, chapterId: string, content: string, parentId?: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!content || content.trim().length === 0) {
    throw new Error("Comment cannot be empty");
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      chapterId,
      userId: session.user.id,
      parentId: parentId || null,
    }
  });

  // Track D: fire notification after successful comment
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: { select: { id: true, authorId: true } } },
    });
    if (chapter?.book) {
      let parentUserId: string | null = null;
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { userId: true },
        });
        parentUserId = parentComment?.userId ?? null;
      }
      await notifyOnComment({
        commenterId: session.user.id,
        commenterName: session.user.name ?? "Someone",
        bookId: chapter.book.id,
        chapterId,
        chapterTitle: chapter.title,
        parentCommentUserId: parentUserId,
        bookAuthorId: chapter.book.authorId,
      });
    }
  } catch (err) {
    console.error("[postComment] notification failed:", err);
  }

  revalidatePath(`/read/${bookId}/${chapterId}`);
  return { success: true };
}

export async function deleteComment(bookId: string, chapterId: string, commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  // Only the author can delete their own comment
  if (comment?.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  revalidatePath(`/read/${bookId}/${chapterId}`);
  return { success: true };
}

export async function toggleLikeComment(bookId: string, chapterId: string, commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.like.findFirst({
    where: { commentId, userId: session.user.id }
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.like.create({
      data: {
        commentId,
        userId: session.user.id
      }
    });
  }

  revalidatePath(`/read/${bookId}/${chapterId}`);
  return { success: true };
}
