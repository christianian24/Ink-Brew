"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addChapterToBook(bookId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content || content.trim() === "<p></p>" || content.trim() === "") {
    throw new Error("Title and content are strictly required.");
  }

  // Security Gate: Ensure the user actually owns this book!
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      chapters: {
        select: { id: true }
      }
    }
  });

  if (!book) throw new Error("Book not found.");
  if (book.authorId !== session.user.id) {
    throw new Error("Forbidden: You do not have permission to modify this book.");
  }

  // Calculate the next chapter position algorithmically
  const nextOrderIndex = book.chapters.length;

  // Extremely rough word count estimation for caching display metrics
  const plainText = content.replace(/<[^>]+>/g, '');
  const wordCount = plainText.trim().split(/\s+/).length;

  await prisma.chapter.create({
    data: {
      title,
      content,
      orderIndex: nextOrderIndex,
      wordCount,
      bookId: book.id,
    }
  });

  // Aggressively flush the cache so the UI updates natively!
  revalidatePath(`/book/${book.id}`);
  revalidatePath(`/book/${book.id}/manage`);
  
  return { success: true };
}

export async function deleteChapter(chapterId: string, bookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true },
  });

  if (!book || book.authorId !== session.user.id) {
    throw new Error("Forbidden");
  }

  // Transaction: delete chapter then reindex remaining ones to close gaps
  await prisma.$transaction(async (tx) => {
    await tx.chapter.delete({ where: { id: chapterId } });

    // Fetch remaining chapters sorted by their current order
    const remaining = await tx.chapter.findMany({
      where: { bookId },
      orderBy: { orderIndex: "asc" },
      select: { id: true },
    });

    // Rewrite orderIndex as 0, 1, 2… to eliminate gaps
    await Promise.all(
      remaining.map((ch, idx) =>
        tx.chapter.update({ where: { id: ch.id }, data: { orderIndex: idx } })
      )
    );
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/book/${bookId}/manage`);
  
  return { success: true };
}

export async function reorderChapter(chapterId: string, bookId: string, direction: "up" | "down") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true },
  });
  if (!book || book.authorId !== session.user.id) throw new Error("Forbidden");

  // Load all chapters in order so we can find neighbours
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { orderIndex: "asc" },
    select: { id: true, orderIndex: true },
  });

  const currentIdx = chapters.findIndex((c) => c.id === chapterId);
  if (currentIdx === -1) throw new Error("Chapter not found");

  const swapIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
  if (swapIdx < 0 || swapIdx >= chapters.length) return { success: true }; // already at boundary

  const current = chapters[currentIdx];
  const neighbour = chapters[swapIdx];

  // Swap their orderIndex values atomically
  await prisma.$transaction([
    prisma.chapter.update({ where: { id: current.id }, data: { orderIndex: neighbour.orderIndex } }),
    prisma.chapter.update({ where: { id: neighbour.id }, data: { orderIndex: current.orderIndex } }),
  ]);

  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/book/${bookId}/manage`);
  return { success: true };
}


// ─── Auto-Save Draft ──────────────────────────────────────────────────────────

export async function saveDraft({
  bookId,
  chapterId,
  title,
  content,
}: {
  bookId: string;
  chapterId: string | null;
  title: string;
  content: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  // Verify ownership
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true },
  });
  if (!book || book.authorId !== session.user.id) return { success: false };

  // findFirst handles nullable chapterId correctly (NULL != NULL in SQL means upsert won't match)
  const existing = await prisma.draft.findFirst({
    where: {
      authorId: session.user.id,
      bookId,
      chapterId: chapterId || null,
      isArchived: false,
    },
  });

  if (existing) {
    await prisma.draft.update({
      where: { id: existing.id },
      data: { title, content, updatedAt: new Date() },
    });
  } else {
    await prisma.draft.create({
      data: {
        authorId: session.user.id,
        bookId,
        chapterId: chapterId || null,
        title,
        content,
      },
    });
  }

  return { success: true, savedAt: new Date().toISOString() };
}

export async function getDraft({
  bookId,
  chapterId,
}: {
  bookId: string;
  chapterId: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.draft.findFirst({
    where: {
      authorId: session.user.id,
      bookId,
      chapterId: chapterId || null,
      isArchived: false,
    },
  });
}

export async function publishChapter(
  bookId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const authorId = session.user.id;

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content || content.trim() === "<p></p>" || content.trim() === "") {
    throw new Error("Title and content are required.");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { chapters: { select: { id: true } } },
  });

  if (!book) throw new Error("Book not found.");
  if (book.authorId !== authorId) throw new Error("Forbidden.");

  const nextOrderIndex = book.chapters.length;
  const plainText = content.replace(/<[^>]+>/g, "");
  const wordCount = plainText.trim().split(/\s+/).length;

  // Transaction: create chapter first, then archive draft.
  // If chapter creation fails, draft is untouched.
  await prisma.$transaction(async (tx) => {
    await tx.chapter.create({
      data: { title, content, orderIndex: nextOrderIndex, wordCount, bookId },
    });

    // Archive the draft (keep for history) — don't hard-delete
    await tx.draft.updateMany({
      where: {
        authorId: authorId,
        bookId,
        chapterId: null,
        isArchived: false,
      },
      data: { isArchived: true },
    });
  });

  // UX: notify everyone who bookmarked this book about the new chapter
  try {
    const bookmarkers = await prisma.bookmark.findMany({
      where: { bookId, userId: { not: authorId } },
      select: { userId: true },
    });
    if (bookmarkers.length > 0) {
      await prisma.notification.createMany({
        data: bookmarkers.map((b) => ({
          userId: b.userId,
          type: "NEW_CHAPTER",
          message: `New chapter "${title}" is now available in "${book.title}"!`,
          link: `/book/${bookId}`,
        })),
      });
    }
  } catch (err) {
    console.error("[publishChapter] bookmark notifications failed:", err);
  }

  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/book/${bookId}/manage`);

  return { success: true };
}

export async function updateChapter(
  bookId: string,
  chapterId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const authorId = session.user.id;

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content || content.trim() === "" || content === "<p></p>") {
    throw new Error("Title and content are required.");
  }

  // Verify ownership via the book
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true },
  });
  if (!book || book.authorId !== session.user.id) throw new Error("Forbidden.");

  const plainText = content.replace(/<[^>]+>/g, "");
  const wordCount = Math.max(1, plainText.trim().split(/\s+/).length);

  // Transaction: update chapter + archive edit draft atomically
  await prisma.$transaction(async (tx) => {
    await tx.chapter.update({
      where: { id: chapterId },
      data: { title, content, wordCount },
    });

    await tx.draft.updateMany({
      where: {
        authorId: authorId,
        bookId,
        chapterId,
        isArchived: false,
      },
      data: { isArchived: true },
    });
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/book/${bookId}/manage`);
  revalidatePath(`/read/${bookId}/${chapterId}`);

  return { success: true };
}

// ─── Draft Discard ────────────────────────────────────────────────────────────

export async function discardDraft(bookId: string, chapterId: string | null) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.draft.deleteMany({
    where: {
      authorId: session.user.id,
      bookId,
      chapterId: chapterId ?? null,
      isArchived: false,
    },
  });

  return { success: true };
}

// ─── Book Status Toggle ───────────────────────────────────────────────────────

export async function toggleBookStatus(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true, status: true },
  });
  if (!book || book.authorId !== session.user.id) throw new Error("Forbidden");

  const newStatus = book.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await prisma.book.update({
    where: { id: bookId },
    data: { status: newStatus },
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/book/${bookId}/manage`);
  revalidatePath("/library");

  return { success: true, newStatus };
}

// --- Book Metadata Editor -----------------------------------------------------

export async function updateBookMetadata(bookId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { authorId: true },
  });
  if (!book || book.authorId !== session.user.id) throw new Error("Forbidden");

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const genreTags = (formData.get("genreTags") as string)?.trim();
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;

  if (!title) throw new Error("Title is required");

  await prisma.book.update({
    where: { id: bookId },
    data: { title, description, genreTags, coverImage },
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath(`/book/${bookId}/manage`);
  revalidatePath("/library");
  revalidatePath("/");

  return { success: true };
}
