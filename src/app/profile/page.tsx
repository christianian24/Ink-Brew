import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BookCard from "@/components/book-card";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Bookmark } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Profile | Ink & Brew",
  description: "View your authored books and reading list.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      books: {
        include: {
          author: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      bookmarks: {
        include: {
          book: {
            include: {
              author: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const bookmarkedBooks = user.bookmarks.filter(b => b.book).map(b => b.book!);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl space-y-16">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-coffee-100 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-coffee-200 rounded-full flex items-center justify-center text-3xl font-serif text-coffee-800">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-coffee-950">{user.name}</h1>
            <p className="text-coffee-600">{user.email}</p>
          </div>
        </div>
        
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}>
          <Button variant="outline" className="gap-2 border-coffee-300 text-coffee-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </form>
      </div>

      {/* Authored Books Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 pb-4">
          <BookOpen className="w-6 h-6 text-coffee-600" />
          <h2 className="text-2xl font-serif font-bold text-coffee-950">Your Works</h2>
        </div>
        
        {user.books.length === 0 ? (
          <div className="text-center py-12 bg-coffee-50 rounded-2xl border border-dashed border-coffee-200">
            <p className="text-coffee-500">You haven't written any books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {user.books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* Bookmarks Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 pb-4">
          <Bookmark className="w-6 h-6 text-coffee-600" />
          <h2 className="text-2xl font-serif font-bold text-coffee-950">Saved Library</h2>
        </div>
        
        {bookmarkedBooks.length === 0 ? (
          <div className="text-center py-12 bg-coffee-50 rounded-2xl border border-dashed border-coffee-200">
            <p className="text-coffee-500">You haven't bookmarked any books yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookmarkedBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
