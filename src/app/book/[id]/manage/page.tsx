import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ListOrdered, BookOpen } from "lucide-react";
import ChapterForm from "@/components/chapter-form";
import ChapterListItem from "@/components/chapter-list-item";
import BookStatusToggle from "@/components/book-status-toggle";
import BookStatsPanel from "@/components/book-stats-panel";
import BookEditForm from "@/components/book-edit-form";

export const dynamic = "force-dynamic";

export default async function ManageBookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const book = await prisma.book.findUnique({
    where: { id: resolvedParams.id },
    include: {
      chapters: {
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!book) {
    notFound();
  }

  // Security Hardening: Only the EXACT author can access this management portal
  if (book.authorId !== session.user.id) {
    redirect(`/book/${book.id}`);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/book/${book.id}`}>
          <Button variant="ghost" className="gap-2 text-coffee-600 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-slate-100 border border-transparent hover:border-coffee-200 dark:hover:border-slate-700">
            <ChevronLeft className="w-4 h-4" /> Back to Book
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <BookStatusToggle bookId={book.id} initialStatus={book.status} />
          <span className="text-sm font-medium text-coffee-400 dark:text-slate-400 bg-coffee-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Author Portal
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-950 dark:text-slate-50">
          Manage: {book.title}
        </h1>
        <p className="text-coffee-600 dark:text-slate-400">
          Reorganize your table of contents or publish a brand new chapter below.
        </p>
      </div>

      {/* Book metadata editor */}
      <BookEditForm
        bookId={book.id}
        initialTitle={book.title}
        initialDescription={book.description ?? ""}
        initialGenreTags={book.genreTags ?? ""}
        initialCoverImage={book.coverImage ?? null}
      />

      {/* Write New Chapter Client boundary */}
      <ChapterForm bookId={book.id} chapterCount={book.chapters.length} />

      {/* Existing Chapters Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-coffee-200 dark:border-slate-800 overflow-hidden shadow-sm mb-12 mt-12">
        <div className="bg-coffee-50 dark:bg-slate-950 border-b border-coffee-200 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
          <ListOrdered className="w-5 h-5 text-coffee-700 dark:text-slate-400" />
          <h2 className="font-serif font-bold text-lg text-coffee-900 dark:text-slate-100">Current Chapters</h2>
        </div>
        
        <div className="divide-y divide-coffee-100 dark:divide-slate-800">
          {book.chapters.length === 0 ? (
            <div className="p-8 justify-center text-center text-coffee-500 dark:text-slate-500 italic flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              No chapters published yet.
            </div>
          ) : (
            book.chapters.map((chapter, idx) => (
              <ChapterListItem
                key={chapter.id}
                chapter={chapter}
                bookId={book.id}
                isFirst={idx === 0}
                isLast={idx === book.chapters.length - 1}
              />
            ))
          )}
        </div>
      </div>

      <BookStatsPanel bookId={book.id} />
    </div>
  );
}
