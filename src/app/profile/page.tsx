import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookCard from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Bookmark, Settings, BookMarked } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile | Ink & Brew",
  description: "View your authored books and reading list.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, currentlyReadingProgress, authorStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true,
        currentStreak: true, longestStreak: true,
        books: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        bookmarks: {
          include: { book: { include: { author: { select: { name: true } } } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.readingProgress.findMany({
      where: {
        userId: session.user.id,
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        chapter: { include: { book: { include: { author: { select: { name: true } } } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    // Author-level stats across all books
    prisma.book.findMany({
      where: { authorId: session.user.id },
      select: {
        _count: { select: { likes: true } },
        chapters: {
          select: {
            content: true,
            _count: { select: { readingProgress: true } },
          },
        },
      },
    }),
  ]);

  if (!user) redirect("/login");

  // Derived author-level stats
  const totalLikes = authorStats.reduce((s, b) => s + b._count.likes, 0);
  const totalReaders = authorStats.reduce(
    (s, b) => s + b.chapters.reduce((cs, ch) => cs + ch._count.readingProgress, 0), 0
  );
  const totalWords = authorStats.reduce(
    (s, b) => s + b.chapters.reduce((cs, ch) => {
      const text = ch.content?.replace(/<[^>]*>/g, " ").trim() ?? "";
      return cs + (text ? text.split(/\s+/).filter(Boolean).length : 0);
    }, 0), 0
  );

  // Deduplicate by bookId — keep only the most recent chapter per book
  const seenBooks = new Set<string>();
  const currentlyReading = currentlyReadingProgress
    .filter((p) => {
      const bookId = p.chapter.book.id;
      if (seenBooks.has(bookId)) return false;
      seenBooks.add(bookId);
      return true;
    })
    .map((p) => p.chapter.book);

  const bookmarkedBooks = user.bookmarks
    .filter((b: any) => b.book && b.type === "BOOKMARK")
    .map((b: any) => b.book!);

  const wantToReadBooks = user.bookmarks
    .filter((b: any) => b.book && b.type === "WANT_TO_READ")
    .map((b: any) => b.book!);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl space-y-16">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-coffee-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-coffee-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl font-serif text-coffee-800 dark:text-slate-200">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-coffee-950 dark:text-slate-50">{user.name}</h1>
            <p className="text-coffee-600 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

      </div>

      {/* Milestones Card */}
      <div className="bg-white dark:bg-slate-900 border border-coffee-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Centered header */}
        <div className="flex flex-row items-center justify-center gap-3 py-2 border-b border-coffee-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-coffee-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-coffee-600 dark:text-slate-400" />
          </div>
          <p className="text-sm font-bold font-serif text-coffee-200 dark:text-slate-200 tracking-wide">Milestones</p>
        </div>
        {/* Stats row — unchanged */}
        <div className="p-6">
          <div className="flex gap-6 flex-wrap items-start">
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{user.currentStreak}</p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Day Streak</p>
            </div>
            <div className="w-px bg-coffee-100 dark:bg-slate-800 self-stretch" />
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{user.longestStreak}</p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Best Streak</p>
            </div>
            <div className="w-px bg-coffee-100 dark:bg-slate-800 self-stretch" />
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{user.books.length}</p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Books Written</p>
            </div>
            <div className="w-px bg-coffee-100 dark:bg-slate-800 self-stretch" />
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{wantToReadBooks.length}</p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Favorites</p>
            </div>
            <div className="w-px bg-coffee-100 dark:bg-slate-800 self-stretch" />
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">
                {totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
              </p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Words Written</p>
            </div>
            <div className="w-px bg-coffee-100 dark:bg-slate-800 self-stretch" />
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{totalReaders}</p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Readers</p>
            </div>
            <div className="w-px bg-coffee-100 dark:bg-slate-800 self-stretch" />
            <div>
              <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{totalLikes}</p>
              <p className="text-xs text-coffee-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Reading Section */}
      {currentlyReading.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-coffee-200 dark:border-slate-800 pb-4">
            <BookMarked className="w-6 h-6 text-coffee-600 dark:text-slate-400" />
            <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">Currently Reading</h2>
            <span className="text-xs font-medium text-coffee-400 dark:text-slate-500 bg-coffee-100 dark:bg-slate-800 px-2 py-1 rounded-full">Last 7 days</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentlyReading.map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* Authored Books Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 dark:border-slate-800 pb-4">
          <BookOpen className="w-6 h-6 text-coffee-600 dark:text-slate-400" />
          <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">Your Works</h2>
        </div>

        {user.books.length === 0 ? (
          <div className="text-center py-12 bg-coffee-50 dark:bg-slate-900 rounded-2xl border border-dashed border-coffee-200 dark:border-slate-800">
            <p className="text-coffee-500 dark:text-slate-400">You haven't written any books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {user.books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* Want to Read Section */}
      {wantToReadBooks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-coffee-200 dark:border-slate-800 pb-4">
            <BookMarked className="w-6 h-6 text-violet-500 dark:text-violet-400" />
            <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">Reading List</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wantToReadBooks.map((book: any) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 dark:border-slate-800 pb-4">
          <Bookmark className="w-6 h-6 text-coffee-600 dark:text-slate-400" />
          <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">Saved Library</h2>
        </div>

        {bookmarkedBooks.length === 0 ? (
          <div className="text-center py-12 bg-coffee-50 dark:bg-slate-900 rounded-2xl border border-dashed border-coffee-200 dark:border-slate-800">
            <p className="text-coffee-500 dark:text-slate-400">You haven't bookmarked any books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookmarkedBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
