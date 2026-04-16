"use server";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

export async function getBooksByPage(page: number, genre?: string, sortBy: string = "newest") {
  try {
    const whereClause: any = { status: "PUBLISHED" };

    if (genre && genre !== "All") {
      whereClause.genreTags = { contains: genre, mode: "insensitive" };
    }

    const orderBy: any =
      sortBy === "oldest"  ? { createdAt: "asc" } :
      sortBy === "az"      ? { title: "asc" } :
      sortBy === "likes"   ? { likes: { _count: "desc" } } :
      sortBy === "saves"   ? { bookmarks: { _count: "desc" } } :
                             { createdAt: "desc" }; // newest (default)

    const books = await prisma.book.findMany({
      where: whereClause,
      include: { author: { select: { name: true } } },
      orderBy,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    });

    return books;
  } catch (error) {
    console.error("Failed to fetch paginated books:", error);
    return [];
  }
}

export async function getHybridGenres() {
  try {
    // 1. The Predefined High-Quality Core Genres
    const coreGenres = ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", "Action", "Slice of Life"];
    const genreSet = new Set<string>();

    // 2. Scan the entire platform for Custom Tags
    const allBooks = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      select: { genreTags: true }
    });

    allBooks.forEach(book => {
      if (book.genreTags) {
        const tags = book.genreTags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach(tag => {
          // Capitalize first letter to standardize the string matching
          const normalized = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
          genreSet.add(normalized);
        });
      }
    });

    // 3. Filter out any duplicates that overlap with Core Genres
    const dynamicTags = Array.from(genreSet).filter(
      tag => !coreGenres.some(c => c.toLowerCase() === tag.toLowerCase())
    );

    // 4. Send the combined hybrid package!
    return [...coreGenres, ...dynamicTags];
  } catch (error) {
    console.error("Failed to fetch hybrid genres:", error);
    // Fallback to core if database scan ever trips up
    return ["Fantasy", "Sci-Fi", "Romance", "Mystery", "Horror", "Action", "Slice of Life"];
  }
}

export async function searchBooks(query: string) {
  if (!query || query.trim().length < 2) return [];

  try {
    return await prisma.book.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { genreTags: { contains: query, mode: "insensitive" } },
          { author: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
  } catch (error) {
    console.error("Failed to search books:", error);
    return [];
  }
}
