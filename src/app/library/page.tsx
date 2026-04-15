import { prisma } from "@/lib/prisma";
import BookCard from "@/components/book-card";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const books = await prisma.book.findMany({
    where: {
      status: "PUBLISHED"
    },
    include: {
      author: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-serif font-bold text-coffee-950">Library</h1>
        <p className="text-coffee-600 max-w-2xl">
          Browse through our collection of published stories. Grab a coffee and find your next favorite book.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-coffee-200">
          <p className="text-coffee-500 font-medium">No books published yet.</p>
          <p className="text-coffee-400 text-sm mt-1">Check back later or start writing one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 gap-4">
          {books.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
