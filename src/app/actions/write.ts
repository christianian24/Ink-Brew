"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createBookWithChapter(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const genreTags = formData.get("genreTags") as string;
  const chapterTitle = formData.get("chapterTitle") as string;
  const content = formData.get("content") as string;

  if (!title || !chapterTitle || !content) {
    throw new Error("Missing required fields");
  }

  // Calculate rough word count
  const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).filter(w => w.length > 0).length;

  const book = await prisma.book.create({
    data: {
      title,
      description: description || "A new story.",
      genreTags: genreTags || "Fiction",
      authorId: session.user.id,
      status: "PUBLISHED", // Auto-publish for MVP
      chapters: {
        create: {
          title: chapterTitle,
          content,
          wordCount,
          orderIndex: 0
        }
      }
    }
  });

  return { success: true, bookId: book.id };
}
