"use server";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function getBooksByPage(page: number) {
  try {
    const books = await prisma.book.findMany({
      where: {
        status: "PUBLISHED"
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    });
    
    return books;
  } catch (error) {
    console.error("Failed to fetch paginated books:", error);
    return [];
  }
}
