import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle, Clock, Users, ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import SocialButtons from "@/components/social-buttons";
import WantToReadButton from "@/components/want-to-read-button";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const book = await prisma.book.findUnique({
    where: { id: resolvedParams.id },
    include: { author: { select: { name: true } } }
  });

  if (!book) {
    return { title: "Book Not Found | Ink & Brew" };
  }

  return {
    title: `${book.title} by ${book.author.name || "Anonymous"} | Ink & Brew`,
    description: book.description.substring(0, 160),
    openGraph: {
      title: `${book.title} | Ink & Brew`,
      description: book.description.substring(0, 160),
      images: book.coverImage ? [book.coverImage] : [],
    }
  };
}

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object before accessing properties
  const resolvedParams = await params;
  // Performance: run all independent queries in parallel
  const [book, session] = await Promise.all([
    prisma.book.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: { select: { name: true, id: true } },
        chapters: { orderBy: { orderIndex: "asc" }, include: { _count: { select: { comments: true } } } },
        _count: { select: { likes: true, bookmarks: true } },
      },
    }),
    auth(),
  ]);

  if (!book) notFound();

  const userId = session?.user?.id;
  const isAuthor = userId === book.authorId;

  const [uniqueReadersCount, likeRecord, bookmarkRecord, progressRecord, wantToReadRecord] = await Promise.all([
    prisma.readingProgress.groupBy({ by: ["userId"], where: { chapter: { bookId: book.id } } }),
    userId ? prisma.like.findFirst({ where: { userId, bookId: book.id } }) : null,
    userId ? prisma.bookmark.findFirst({ where: { userId, bookId: book.id, type: "BOOKMARK" } }) : null,
    userId ? prisma.readingProgress.findFirst({
      where: { userId, chapter: { bookId: book.id } },
      orderBy: { updatedAt: "desc" },
      include: { chapter: { select: { id: true, title: true, orderIndex: true } } },
    }) : null,
    userId ? prisma.bookmark.findFirst({ where: { userId, bookId: book.id, type: "WANT_TO_READ" } }) : null,
  ]);

  const totalReaders = uniqueReadersCount.length;
  const isLiked = !!likeRecord;
  const isBookmarked = !!bookmarkRecord;
  const isWantToRead = !!wantToReadRecord;

  // Track E: Continue Reading
  let continueReading: { chapterId: string; title: string; orderIndex: number } | null = null;
  if (progressRecord?.chapter) {
    continueReading = {
      chapterId: progressRecord.chapter.id,
      title: progressRecord.chapter.title,
      orderIndex: progressRecord.chapter.orderIndex,
    };
  }

  const isPublished = book.status === "PUBLISHED";
  const wordCount = book.chapters.reduce((acc: number, ch: any) => acc + ch.wordCount, 0);
  const readTimeMin = Math.ceil(wordCount / 200);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        
        {/* Left Column: Cover & Actions */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="aspect-[2/3] bg-coffee-100 dark:bg-slate-800 rounded-2xl border border-coffee-200 dark:border-slate-800 overflow-hidden shadow-md flex items-center justify-center relative">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-24 h-24 text-coffee-300 dark:text-slate-600" />
            )}
          </div>

          <div className="space-y-3">
            {/* Continue Reading banner — shown to readers who've started this book */}
            {continueReading && !isAuthor && (
              <Link href={`/read/${book.id}/${continueReading.chapterId}`} className="block">
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors">
                  <PlayCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Continue Reading</p>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200 truncate">
                      Ch. {continueReading.orderIndex + 1} — {continueReading.title}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {book.chapters.length > 0 ? (
              <Link href={`/read/${book.id}/${book.chapters[0].id}`} className="block">
                <Button className="w-full text-lg h-12 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700" size="lg">
                  {continueReading ? "Start from Beginning" : "Start Reading"}
                </Button>
              </Link>
            ) : (
              <Button disabled className="w-full text-lg h-12" size="lg">No Chapters Yet</Button>
            )}

            <SocialButtons 
              bookId={book.id} 
              initialLiked={isLiked} 
              initialBookmarked={isBookmarked} 
              initialLikeCount={book._count.likes} 
              initialBookmarkCount={book._count.bookmarks} 
            />

            {userId && !isAuthor && (
              <WantToReadButton bookId={book.id} initialWantToRead={isWantToRead} />
            )}

            {isAuthor && (
              <div className="pt-4 border-t border-coffee-200 dark:border-slate-800">
                <Link href={`/book/${book.id}/manage`} className="block">
                  <Button variant="outline" className="w-full h-12 border-coffee-300 dark:border-slate-700 text-coffee-800 dark:text-slate-300 hover:bg-coffee-50 dark:hover:bg-slate-800 dark:bg-transparent gap-2">
                    <BookOpen className="w-4 h-4" /> Manage Book
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details & Chapters */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            {/* Back button row */}
            <div className="flex items-center justify-end">
              <Link
                href="/library"
                className="inline-flex items-center gap-1 text-sm text-coffee-500 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-coffee-950 dark:text-slate-50 leading-tight">
              {book.title}
            </h1>
            <p className="text-lg text-coffee-700 dark:text-slate-300">
              by <Link href={`/author/${book.author.id}`} className="font-semibold hover:underline">{book.author.name || "Anonymous"}</Link>
            </p>

            <div className="flex items-center gap-4 text-sm text-coffee-600 dark:text-slate-400 border-y border-coffee-200 dark:border-slate-800 py-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{book.chapters.length} Chapters</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-coffee-300 dark:bg-white hidden md:block" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>~{readTimeMin} min read</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-coffee-300 dark:bg-white" />
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{totalReaders} {totalReaders === 1 ? 'reader' : 'readers'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-coffee-300 dark:bg-white hidden md:block" />
              <div className="capitalize">{book.genreTags.split(',')[0]}</div>
            </div>
          </div>

          <div className="prose prose-coffee dark:prose-invert max-w-none text-coffee-800 dark:text-slate-300 leading-relaxed">
            {book.description.split('\n').map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-8 border-t border-coffee-200 dark:border-slate-800 space-y-6">
            <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">Table of Contents</h2>
            
            <div className="space-y-3">
              {book.chapters.length === 0 ? (
                <p className="text-coffee-500 dark:text-slate-400 italic">This book has no chapters published yet.</p>
              ) : (
                book.chapters.map((chapter: any) => (
                  <Link 
                    key={chapter.id} 
                    href={`/read/${book.id}/${chapter.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-coffee-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-coffee-300 dark:hover:border-slate-600 hover:shadow-sm transition-all group"
                  >
                  <div className="flex items-center gap-3">
                      <span className="text-coffee-400 dark:text-slate-500 font-mono text-sm w-6">
                        {String(chapter.orderIndex + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-medium text-coffee-900 dark:text-slate-200 group-hover:text-coffee-600 dark:group-hover:text-slate-100 transition-colors">
                        {chapter.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {chapter._count?.comments > 0 && (
                        <span className="flex items-center gap-1 text-xs text-coffee-400 dark:text-slate-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10M3 6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5l-4 4V6z" /></svg>
                          {chapter._count.comments}
                        </span>
                      )}
                      <span className="text-sm text-coffee-400 dark:text-slate-500">
                        {chapter.wordCount} words
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
