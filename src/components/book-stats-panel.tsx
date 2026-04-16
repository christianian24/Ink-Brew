import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, MessageSquare, Bookmark, Heart } from "lucide-react";

interface Props {
  bookId: string;
}

export default async function BookStatsPanel({ bookId }: Props) {
  const [book, chapterStats] = await Promise.all([
    prisma.book.findUnique({
      where: { id: bookId },
      select: { _count: { select: { likes: true, bookmarks: true } } },
    }),
    prisma.chapter.findMany({
      where: { bookId },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        _count: { select: { comments: true, readingProgress: true } },
      },
    }),
  ]);

  if (!book) return null;

  const totalReaders = chapterStats.reduce((sum, ch) => sum + ch._count.readingProgress, 0);
  const totalComments = chapterStats.reduce((sum, ch) => sum + ch._count.comments, 0);
  const maxReads = Math.max(...chapterStats.map((c) => c._count.readingProgress), 1);

  const overviewCards = [
    { icon: Users,         label: "Total Reads", value: totalReaders     },
    { icon: MessageSquare, label: "Comments",     value: totalComments    },
    { icon: Bookmark,      label: "Bookmarks",    value: book._count.bookmarks },
    { icon: Heart,         label: "Likes",        value: book._count.likes     },
  ];

  return (
    <div className="mt-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-coffee-600 dark:text-slate-400" />
        <h2 className="font-serif font-bold text-xl text-coffee-900 dark:text-slate-100">Book Stats</h2>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewCards.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 border border-coffee-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-coffee-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-coffee-600 dark:text-slate-400" />
            </div>
            <p className="text-2xl font-bold font-serif text-coffee-950 dark:text-slate-50">{value.toLocaleString()}</p>
            <p className="text-xs font-semibold text-coffee-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Per-chapter breakdown */}
      {chapterStats.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-coffee-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-coffee-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-coffee-700 dark:text-slate-300 uppercase tracking-wider">Chapter Breakdown</h3>
            <span className="text-xs text-coffee-400 dark:text-slate-500">{chapterStats.length} chapters</span>
          </div>
          <div className="divide-y divide-coffee-50 dark:divide-slate-800/80">
            {chapterStats.map((ch) => {
              const readPct = Math.round((ch._count.readingProgress / maxReads) * 100);
              return (
                <div key={ch.id} className="px-6 py-4 hover:bg-coffee-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-xs font-mono font-bold text-coffee-300 dark:text-slate-600 w-6 flex-shrink-0">
                      {String(ch.orderIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-coffee-800 dark:text-slate-200 flex-1 truncate">{ch.title}</span>
                    <div className="flex items-center gap-4 text-xs text-coffee-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {ch._count.readingProgress}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {ch._count.comments}
                      </span>
                    </div>
                  </div>
                  {/* Relative read bar */}
                  <div className="ml-10 h-1.5 bg-coffee-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coffee-400 dark:bg-slate-500 rounded-full transition-all duration-500"
                      style={{ width: `${readPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
