"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import BookCard from "@/components/book-card";
import { getBooksByPage } from "@/app/actions/library";
import { Loader2, BookOpen } from "lucide-react";

export default function LibraryGrid({ initialBooks }: { initialBooks: any[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialBooks.length >= 12);
  const [isLoading, setIsLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px" // Pre-fetch before they actually hit absolute bottom
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMoreBooks();
    }
  }, [inView, hasMore, isLoading]);

  const loadMoreBooks = async () => {
    setIsLoading(true);
    
    // Slight artificial delay to prevent violent layout thrashing during extreme speed
    await new Promise(r => setTimeout(r, 300)); 
    
    const nextPageNumber = page + 1;
    const nextChunkOfBooks = await getBooksByPage(nextPageNumber);
    
    if (nextChunkOfBooks && nextChunkOfBooks.length > 0) {
      setBooks((prevBooks) => [...prevBooks, ...nextChunkOfBooks]);
      setPage(nextPageNumber);
      
      // If we received fewer books than our MAX_CHUNK size, we reached the end of the database!
      if (nextChunkOfBooks.length < 12) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
    
    setIsLoading(false);
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-coffee-200">
        <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-coffee-400" />
        </div>
        <p className="text-coffee-600 font-bold text-lg">No books published yet.</p>
        <p className="text-coffee-500 mt-2">Check back later or start writing your own story!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="w-full flex justify-center items-center mt-16 py-8">
          <Loader2 className="w-8 h-8 text-coffee-400 animate-spin" />
        </div>
      )}

      {!hasMore && books.length > 0 && (
        <div className="w-full text-center mt-16 pb-8">
          <div className="w-16 h-0.5 bg-coffee-200 mx-auto mb-6 rounded-full" />
          <p className="font-serif text-coffee-500 italic">You've reached the end of the library shelf.</p>
        </div>
      )}
    </>
  );
}
