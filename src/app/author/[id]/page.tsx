import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import BookCard from "@/components/book-card";
import FollowButton from "@/components/follow-button";
import { BookOpen, Feather } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const author = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  if (!author) return { title: "Author Not Found | Ink & Brew" };
  return {
    title: `${author.name} | Ink & Brew`,
    description: `Browse all published books by ${author.name} on Ink & Brew.`,
  };
}

export default async function AuthorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [author, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        books: {
          where: { status: "PUBLISHED" },
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { followers: true } },
      },
    }),
    auth(),
  ]);

  if (!author) notFound();

  const viewerIsAuthor = session?.user?.id === author.id;
  const followerCount = author._count.followers;

  let isFollowing = false;
  if (session?.user?.id && !viewerIsAuthor) {
    const record = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: author.id } },
    });
    isFollowing = !!record;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl space-y-12">
      {/* Author Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 border border-coffee-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-coffee-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {author.image ? (
              <img src={author.image} alt={author.name ?? "Author"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-serif font-bold text-coffee-700 dark:text-slate-300">
                {author.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            )}
          </div>

            <div className="text-center md:text-left space-y-3">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Feather className="w-5 h-5 text-coffee-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-coffee-500 dark:text-slate-400 uppercase tracking-wide">Author</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-coffee-950 dark:text-slate-50">
              {author.name ?? "Anonymous"}
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-coffee-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {author.books.length} {author.books.length === 1 ? "book" : "books"} published
                </span>
                <span>
                  Member since {new Date(author.createdAt).toLocaleDateString([], { year: "numeric", month: "long" })}
                </span>
              </div>
              {!viewerIsAuthor && (
                <FollowButton
                  authorId={author.id}
                  initialIsFollowing={isFollowing}
                  initialFollowerCount={followerCount}
                />
              )}
              {viewerIsAuthor && (
                <span className="text-sm text-coffee-400 dark:text-slate-500">
                  <span className="font-bold text-coffee-700 dark:text-slate-300">{followerCount}</span> {followerCount === 1 ? "follower" : "followers"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 dark:border-slate-800 pb-4">
          <BookOpen className="w-6 h-6 text-coffee-600 dark:text-slate-400" />
          <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">Published Works</h2>
        </div>

        {author.books.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-coffee-200 dark:border-slate-800 rounded-2xl">
            <p className="text-coffee-500 dark:text-slate-400">This author hasn't published any books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {author.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
