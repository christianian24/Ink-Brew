import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Bookmark, Heart, Clock, Users } from "lucide-react";
import { auth } from "@/auth";
import SocialButtons from "@/components/social-buttons";
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
  const book = await prisma.book.findUnique({
    where: { id: resolvedParams.id },
    include: {
      author: { select: { name: true, id: true } },
      chapters: {
        orderBy: { orderIndex: 'asc' }
      },
      _count: {
        select: { likes: true, bookmarks: true }
      }
    }
  });

  if (!book) {
    notFound();
  }

  const uniqueReadersCount = await prisma.readingProgress.groupBy({
    by: ['userId'],
    where: { chapter: { bookId: book.id } },
  });
  const totalReaders = uniqueReadersCount.length;

  const session = await auth();
  const userId = session?.user?.id;

  let isLiked = false;
  let isBookmarked = false;

  if (userId) {
    const like = await prisma.like.findFirst({ where: { userId, bookId: book.id } });
    isLiked = !!like;
    
    const bookmark = await prisma.bookmark.findUnique({ 
      where: { userId_bookId: { userId, bookId: book.id } } 
    });
    isBookmarked = !!bookmark;
  }

  const isPublished = book.status === "PUBLISHED";
  const wordCount = book.chapters.reduce((acc: number, ch: any) => acc + ch.wordCount, 0);
  const readTimeMin = Math.ceil(wordCount / 200); // avg reading speed 200wpm

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        
        {/* Left Column: Cover & Actions */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="aspect-[2/3] bg-coffee-100 rounded-2xl border border-coffee-200 overflow-hidden shadow-md flex items-center justify-center relative">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-24 h-24 text-coffee-300" />
            )}
          </div>

          <div className="space-y-3">
            {book.chapters.length > 0 ? (
              <Link href={`/read/${book.id}/${book.chapters[0].id}`} className="block">
                <Button className="w-full text-lg h-12" size="lg">Start Reading</Button>
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
          </div>
        </div>

        {/* Right Column: Details & Chapters */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-coffee-950 leading-tight">
              {book.title}
            </h1>
            <p className="text-lg text-coffee-700">
              by <Link href={`/profile/${book.author.id}`} className="font-semibold hover:underline">{book.author.name || "Anonymous"}</Link>
            </p>

            <div className="flex items-center gap-4 text-sm text-coffee-600 border-y border-coffee-200 py-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{book.chapters.length} Chapters</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-coffee-300 hidden md:block" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>~{readTimeMin} min read</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-coffee-300" />
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{totalReaders} {totalReaders === 1 ? 'reader' : 'readers'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-coffee-300 hidden md:block" />
              <div className="capitalize">{book.genreTags.split(',')[0]}</div>
            </div>
          </div>

          <div className="prose prose-coffee max-w-none text-coffee-800 leading-relaxed">
            {book.description.split('\n').map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-8 border-t border-coffee-200 space-y-6">
            <h2 className="text-2xl font-serif font-bold text-coffee-950">Table of Contents</h2>
            
            <div className="space-y-3">
              {book.chapters.length === 0 ? (
                <p className="text-coffee-500 italic">This book has no chapters published yet.</p>
              ) : (
                book.chapters.map((chapter: any) => (
                  <Link 
                    key={chapter.id} 
                    href={`/read/${book.id}/${chapter.id}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-coffee-100 bg-white hover:border-coffee-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-coffee-400 font-mono text-sm w-6">
                        {String(chapter.orderIndex + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-medium text-coffee-900 group-hover:text-coffee-600 transition-colors">
                        {chapter.title}
                      </h3>
                    </div>
                    <span className="text-sm text-coffee-400">
                      {chapter.wordCount} words
                    </span>
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
