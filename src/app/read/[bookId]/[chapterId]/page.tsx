import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import CommentSection from "@/components/comments/comment-section";
import ReaderEngine from "@/components/reader-engine";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ bookId: string; chapterId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const book = await prisma.book.findUnique({
    where: { id: resolvedParams.bookId },
    select: { title: true }
  });
  
  const chapter = await prisma.chapter.findUnique({
    where: { id: resolvedParams.chapterId },
    select: { title: true }
  });

  if (!chapter || !book) {
    return { title: "Chapter Not Found | Ink & Brew" };
  }

  return {
    title: `${chapter.title} - ${book.title} | Ink & Brew`,
  };
}

export default async function ReadChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const resolvedParams = await params;
  const bookId = resolvedParams.bookId;
  const chapterId = resolvedParams.chapterId;

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, title: true, orderIndex: true }
      }
    }
  });

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId }
  });

  if (!book || !chapter || chapter.bookId !== bookId) {
    notFound();
  }

  const session = await auth();

  const currentIndex = chapter.orderIndex;
  const prevChapter = book.chapters.find((c: any) => c.orderIndex === currentIndex - 1);
  const nextChapter = book.chapters.find((c: any) => c.orderIndex === currentIndex + 1);

  // Fetch the top-level comments and heavily nest the replies up to 3 layers deep!
  const rootComments = await prisma.comment.findMany({
    where: { chapterId: chapter.id, parentId: null },
    include: {
      user: { select: { name: true, image: true, id: true } },
      likes: true,
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { name: true, image: true, id: true } },
          likes: true,
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { name: true, image: true, id: true } },
              likes: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-coffee-50 dark:bg-slate-950 flex flex-col items-center">
      {/* Top minimal navigation */}
      <div className="sticky top-0 w-full bg-coffee-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-coffee-200 dark:border-slate-800 z-10 transition-all">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/book/${bookId}`} className="flex items-center gap-2 text-coffee-600 dark:text-slate-400 hover:text-coffee-950 dark:hover:text-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:inline">{book.title}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-coffee-400 dark:text-slate-500">
              {String(currentIndex + 1).padStart(2, '0')} / {String(book.chapters.length).padStart(2, '0')}
            </span>
            <Button variant="ghost" size="icon" className="text-coffee-600 dark:text-slate-400">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reading Content */}
      <main className="flex-1 w-full max-w-2xl px-6 py-12 md:py-20">
        
        <ReaderEngine chapterId={chapter.id} content={chapter.content} title={chapter.title} />

        {/* Bottom Navigation */}
        <div className="mt-24 pt-8 border-t border-coffee-200 dark:border-slate-800 flex items-center justify-between">
          {prevChapter ? (
            <Link href={`/read/${bookId}/${prevChapter.id}`}>
              <Button variant="outline" className="gap-2 border-coffee-300 dark:border-slate-700 text-coffee-700 dark:text-slate-300 dark:bg-transparent dark:hover:bg-slate-800 h-12 px-6">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Link href={`/read/${bookId}/${nextChapter.id}`}>
              <Button className="gap-2 bg-coffee-800 dark:bg-slate-800 hover:bg-coffee-900 dark:hover:bg-slate-700 dark:text-slate-50 h-12 px-6">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/book/${bookId}`}>
              <Button variant="outline" className="gap-2 border-coffee-300 dark:border-slate-700 text-coffee-700 dark:text-slate-300 dark:bg-transparent dark:hover:bg-slate-800 h-12 px-6">
                <BookOpen className="w-4 h-4" /> Book Page
              </Button>
            </Link>
          )}
        </div>

        {/* Community Interactive Comment Board */}
        <CommentSection 
          bookId={bookId}
          chapterId={chapterId}
          currentUserId={session?.user?.id}
          comments={rootComments}
        />
      </main>
    </div>
  );
}
