import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// This endpoint exists solely for navigator.sendBeacon() calls on tab close.
// Server Actions are async and can't be awaited reliably in beforeunload.
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, chapterId, title, content } = body;

    // content is required to save a draft
    if (content === undefined) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // Verify ownership ONLY if bookId is provided (existing book)
    if (bookId) {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { authorId: true },
      });
      if (!book || book.authorId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // findFirst + upsert by id (handles nullable bookId/chapterId correctly)
    const existing = await prisma.draft.findFirst({
      where: {
        authorId: session.user.id,
        bookId: bookId || null,
        chapterId: chapterId || null,
        isArchived: false,
      },
    });

    if (existing) {
      await prisma.draft.update({
        where: { id: existing.id },
        data: { title: title || "", content, updatedAt: new Date() },
      });
    } else {
      await prisma.draft.create({
        data: {
          authorId: session.user.id,
          bookId: bookId || null,
          chapterId: chapterId || null,
          title: title || "",
          content,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/draft POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
