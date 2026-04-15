"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_bookId: {
        userId,
        bookId
      }
    }
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: { id: existingBookmark.id }
    });
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        bookId
      }
    });
  }

  revalidatePath(`/book/[id]`, "page");
  revalidatePath(`/profile`);
}

export async function toggleLike(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      bookId
    }
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id }
    });
  } else {
    await prisma.like.create({
      data: {
        userId,
        bookId
      }
    });
  }

  revalidatePath(`/book/[id]`, "page");
}
