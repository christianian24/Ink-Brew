import { getBooksByPage } from "@/app/actions/library";
import LibraryGrid from "@/components/library-grid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library | Ink & Brew",
  description: "Browse through our collection of published stories. Grab a coffee and find your next favorite book.",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  // Start by heavily rate-limiting the Server to only download Page 1 (12 books)
  // The Client Component will silently handle the rest as the user scrolls!
  const initialBooks = await getBooksByPage(1);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-serif font-bold text-coffee-950">Library</h1>
        <p className="text-coffee-600 max-w-2xl">
          Browse through our collection of published stories. Grab a coffee and find your next favorite book.
        </p>
      </div>

      <LibraryGrid initialBooks={initialBooks} />
    </div>
  );
}
