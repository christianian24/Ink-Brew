import Link from "next/link";
import { Book as BookModel, User } from "@/generated/prisma";
import { BookOpen } from "lucide-react";

type BookWithAuthor = BookModel & {
  author: {
    name: string | null;
  };
};

export default function BookCard({ book }: { book: BookWithAuthor }) {
  return (
    <Link href={`/book/${book.id}`}>
      <div className="group flex flex-col bg-white dark:bg-slate-900 border border-coffee-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
        {/* Cover Placeholder */}
        <div className="w-full aspect-[2/3] bg-coffee-100 dark:bg-slate-800 relative items-center justify-center flex border-b border-coffee-50 dark:border-slate-800/50 group-hover:bg-coffee-200 dark:group-hover:bg-slate-700 transition-colors">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="object-cover w-full h-full" />
          ) : (
            <BookOpen className="w-12 h-12 text-coffee-300 dark:text-slate-600" />
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-serif font-bold text-coffee-950 dark:text-slate-50 line-clamp-2 md:text-lg">
            {book.title}
          </h3>
          <p className="text-coffee-600 dark:text-slate-400 text-sm mt-1 mb-3">
            by {book.author.name || "Anonymous"}
          </p>
          
          <p className="text-coffee-500 dark:text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
            {book.description}
          </p>
          
          <div className="flex items-center gap-2 mt-auto">
            {book.genreTags.split(',').slice(0, 2).map(tag => (
              tag.trim() ? (
                <span key={tag} className="text-xs font-semibold bg-coffee-50 dark:bg-slate-800 text-coffee-700 dark:text-slate-300 px-2 py-1 rounded-full border border-transparent dark:border-slate-700">
                  {tag.trim()}
                </span>
              ) : null
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
