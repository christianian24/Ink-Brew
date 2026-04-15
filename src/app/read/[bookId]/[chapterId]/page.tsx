import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

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
  if (session?.user?.id) {
    try {
      await prisma.readingProgress.upsert({
        where: {
          userId_chapterId: {
            userId: session.user.id,
            chapterId: chapter.id
          }
        },
        update: {},
        create: {
          userId: session.user.id,
          chapterId: chapter.id
        }
      });
    } catch (e) {
      // Silently fail if progress tracking has an unhandled race condition
      console.error(e);
    }
  }

  const currentIndex = chapter.orderIndex;
  const prevChapter = book.chapters.find((c: any) => c.orderIndex === currentIndex - 1);
  const nextChapter = book.chapters.find((c: any) => c.orderIndex === currentIndex + 1);

  return (
    <div className="min-h-screen bg-coffee-50 flex flex-col items-center">
      {/* Top minimal navigation */}
      <div className="sticky top-0 w-full bg-coffee-50/90 backdrop-blur-md border-b border-coffee-200 z-10 transition-all">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/book/${bookId}`} className="flex items-center gap-2 text-coffee-600 hover:text-coffee-950 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:inline">{book.title}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-coffee-400">
              {String(currentIndex + 1).padStart(2, '0')} / {String(book.chapters.length).padStart(2, '0')}
            </span>
            <Button variant="ghost" size="icon" className="text-coffee-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reading Content */}
      <main className="flex-1 w-full max-w-2xl px-6 py-12 md:py-20">
        <div className="space-y-4 mb-16 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-950">
            {chapter.title}
          </h1>
          <div className="w-16 h-0.5 bg-coffee-300 mx-auto rounded-full" />
        </div>

        {/* Since chapter content could be HTML from TipTap, we use dangerouslySetInnerHTML */}
        <div 
          className="prose prose-coffee prose-lg md:prose-xl max-w-none text-coffee-900 font-serif leading-loose"
          dangerouslySetInnerHTML={{ __html: chapter.content }}
        />

        {/* Bottom Navigation */}
        <div className="mt-24 pt-8 border-t border-coffee-200 flex items-center justify-between">
          {prevChapter ? (
            <Link href={`/read/${bookId}/${prevChapter.id}`}>
              <Button variant="outline" className="gap-2 border-coffee-300 text-coffee-700 h-12 px-6">
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Link href={`/read/${bookId}/${nextChapter.id}`}>
              <Button className="gap-2 bg-coffee-800 hover:bg-coffee-900 h-12 px-6">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/book/${bookId}`}>
              <Button variant="outline" className="gap-2 border-coffee-300 text-coffee-700 h-12 px-6">
                <BookOpen className="w-4 h-4" /> Book Page
              </Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
