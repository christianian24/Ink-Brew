"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function postComment(bookId: string, chapterId: string, content: string, parentId?: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!content || content.trim().length === 0) {
    throw new Error("Comment cannot be empty");
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      chapterId,
      userId: session.user.id,
      parentId: parentId || null,
    }
  });

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
