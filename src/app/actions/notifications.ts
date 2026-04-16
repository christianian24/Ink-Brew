"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Create a notification (internal helper) ──────────────────────────────────
async function createNotification({
  userId,
  type,
  message,
  link,
}: {
  userId: string;
  type: string;
  message: string;
  link: string;
}) {
  try {
    await prisma.notification.create({
      data: { userId, type, message, link },
    });
  } catch (err) {
    // Never crash the main action because of a notification failure
    console.error("[createNotification] failed:", err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });
}

export async function markAllRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/");
}

export async function markOneRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

// ── Called by comments.ts after a successful postComment ─────────────────────
export async function notifyOnComment({
  commenterId,
  commenterName,
  bookId,
  chapterId,
  chapterTitle,
  parentCommentUserId,
  bookAuthorId,
}: {
  commenterId: string;
  commenterName: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  parentCommentUserId: string | null;
  bookAuthorId: string;
}) {
  const link = `/read/${bookId}/${chapterId}#comments`;

  if (parentCommentUserId) {
    // Reply: notify parent comment's author (not self)
    if (parentCommentUserId !== commenterId) {
      await createNotification({
        userId: parentCommentUserId,
        type: "REPLY",
        message: `${commenterName} replied to your comment on "${chapterTitle}".`,
        link,
      });
    }
  } else {
    // Top-level comment: notify the book's author (not self)
    if (bookAuthorId !== commenterId) {
      await createNotification({
        userId: bookAuthorId,
        type: "NEW_COMMENT",
        message: `${commenterName} commented on your chapter "${chapterTitle}".`,
        link,
      });
    }
  }
}
