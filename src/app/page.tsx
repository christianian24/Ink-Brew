import Link from "next/link";
import { BookOpen, Coffee, Feather, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/book-card";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [session, topBooks] = await Promise.all([
    auth(),
    prisma.book.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: { select: { name: true } },
        _count: { select: { likes: true, bookmarks: true } },
      },
      orderBy: [{ likes: { _count: "desc" } }, { bookmarks: { _count: "desc" } }],
      take: 5,
    }),
  ]);

  return (
    <div className="flex flex-col items-center px-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl pt-24 pb-16">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-coffee-950 dark:text-slate-50 tracking-tight">
          Your Cozy Corner for <br className="hidden md:block" />
          <span className="text-coffee-600 dark:text-slate-400 italic">Reading &amp; Writing</span>
        </h1>
        <p className="text-lg text-coffee-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Welcome to Ink &amp; Brew. Grab a virtual coffee, explore a library of independent novels,
          or start writing your own masterpiece in our distraction-free editor.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/library">
            <Button size="lg" className="gap-2 bg-coffee-800 dark:bg-slate-800 hover:bg-coffee-900 dark:hover:bg-slate-700 dark:text-slate-50 border-none">
              <BookOpen className="w-5 h-5" />
              Browse Library
            </Button>
          </Link>
          <Link href={session ? "/write" : "/register"}>
            <Button size="lg" variant="outline" className="gap-2 border-coffee-300 dark:border-slate-700 text-coffee-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 bg-transparent">
              <Feather className="w-5 h-5" />
              {session ? "Start Writing" : "Join Free"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Top Books Section */}
      {topBooks.length > 0 && (
        <section className="w-full max-w-5xl pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-coffee-950 dark:text-slate-50">
                Most Loved Stories
              </h2>
              <p className="text-sm text-coffee-500 dark:text-slate-400 mt-1">
                Ranked by likes &amp; saves from the community
              </p>
            </div>
            <Link
              href="/library"
              className="text-sm font-semibold text-coffee-600 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-slate-100 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {topBooks.map((book, i) => (
              <div key={book.id} className="relative">
                {i === 0 && (
                  <span className="absolute -top-2 -left-2 z-10 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    #1
                  </span>
                )}
                <BookCard book={book} />
                {/* Like + bookmark mini-stats */}
                <div className="flex items-center gap-3 mt-2 px-1 text-xs text-coffee-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {book._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> {book._count.bookmarks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feature grid — only show when no books yet */}
      {topBooks.length === 0 && (
        <section className="grid md:grid-cols-3 gap-8 max-w-5xl w-full pt-16 pb-20">
          {[
            { icon: BookOpen, title: "Curated Library", desc: "Discover stories from upcoming authors across all genres in a beautiful reading environment." },
            { icon: Feather, title: "Distraction-Free Editor", desc: "Draft your chapters with autosave and simple formatting right from your browser." },
            { icon: Coffee, title: "Coffee Shop Vibe", desc: "Enjoy a warm, minimalistic paper-like UI that makes reading and writing a pleasure." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-coffee-100 dark:border-slate-800 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-coffee-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-coffee-600 dark:text-slate-400">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-coffee-900 dark:text-slate-100">{title}</h3>
              <p className="text-coffee-600 dark:text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
