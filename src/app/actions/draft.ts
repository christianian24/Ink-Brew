"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveBookDraft(data: {
  title: string;
  description: string;
  genreTags: string;
  coverImage?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.bookDraft.upsert({
    where: { authorId: session.user.id },
    create: {
      authorId: session.user.id,
      ...data,
    },
    update: {
      ...data,
      updatedAt: new Date(),
    },
  });

  return { success: true };
}

export async function getBookDraft() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.bookDraft.findUnique({
    where: { authorId: session.user.id },
  });
}

export async function clearBookDraft() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.bookDraft.deleteMany({
    where: { authorId: session.user.id },
  });
}

/**
 * Clears both the metadata and the first chapter draft after publishing a new book.
 */
export async function clearDraftsForNewBook() {
  const session = await auth();
  if (!session?.user?.id) return;

  await Promise.all([
    prisma.bookDraft.deleteMany({ where: { authorId: session.user.id } }),
    prisma.draft.updateMany({
      where: {
        authorId: session.user.id,
        bookId: null,
        chapterId: null,
        isArchived: false,
      },
      data: { isArchived: true },
    }),
  ]);
}

export async function getInitialChapterDraft() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.draft.findFirst({
    where: {
      authorId: session.user.id,
      bookId: null,
      chapterId: null,
      isArchived: false,
    },
    orderBy: { updatedAt: "desc" },
  });
}
