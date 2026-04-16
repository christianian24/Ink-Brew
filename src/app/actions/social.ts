"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Find the BOOKMARK-type record (not WANT_TO_READ)
  const existingBookmark = await prisma.bookmark.findFirst({
    where: { userId, bookId, type: "BOOKMARK" },
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
  } else {
    await prisma.bookmark.create({ data: { userId, bookId, type: "BOOKMARK" } });
  }

  revalidatePath(`/book/[id]`, "page");
  revalidatePath(`/profile`);
}

export async function toggleLike(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existingLike = await prisma.like.findFirst({ where: { userId, bookId } });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
  } else {
    await prisma.like.create({ data: { userId, bookId } });
  }

  revalidatePath(`/book/[id]`, "page");
}

// ─── Follow / Unfollow ────────────────────────────────────────────────────────

export async function followAuthor(authorId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.id === authorId) throw new Error("Cannot follow yourself");
  const followerId = session.user.id;

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId: authorId } },
    create: { followerId, followingId: authorId },
    update: {},
  });

  await prisma.notification.create({
    data: {
      userId: authorId,
      type: "NEW_FOLLOWER",
      message: `${session.user.name ?? "Someone"} started following you!`,
      link: `/author/${followerId}`,
    },
  });

  revalidatePath(`/author/${authorId}`);
  return { success: true };
}

export async function unfollowAuthor(authorId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followingId: authorId },
  });

  revalidatePath(`/author/${authorId}`);
  return { success: true };
}

export async function getFollowStatus(
  authorId: string
): Promise<{ isFollowing: boolean; followerCount: number }> {
  const session = await auth();

  const [followerCount, followRecord] = await Promise.all([
    prisma.follow.count({ where: { followingId: authorId } }),
    session?.user?.id
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: session.user.id, followingId: authorId } },
        })
      : null,
  ]);

  return { isFollowing: !!followRecord, followerCount };
}

// ─── Want to Read ─────────────────────────────────────────────────────────────

export async function toggleWantToRead(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const existing = await prisma.bookmark.findFirst({
    where: { userId, bookId, type: "WANT_TO_READ" },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    revalidatePath(`/book/${bookId}`);
    revalidatePath(`/profile`);
    return { success: true, added: false };
  }

  await prisma.bookmark.create({ data: { userId, bookId, type: "WANT_TO_READ" } });
  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/profile`);
  return { success: true, added: true };
}
