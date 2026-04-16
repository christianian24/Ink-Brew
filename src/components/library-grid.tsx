"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import BookCard from "@/components/book-card";
import { getBooksByPage, searchBooks } from "@/app/actions/library";
import { Loader2, BookOpen, Search, X, ArrowUpDown } from "lucide-react";

export default function LibraryGrid({ initialBooks, availableGenres = [] }: { initialBooks: any[], availableGenres?: string[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialBooks.length >= 12);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const [selectedSort, setSelectedSort] = useState("newest");

  // Track G: search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const genres = ["All", ...availableGenres];
  const { ref, inView } = useInView({ threshold: 0, rootMargin: "200px" });

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && books.length > 0 && !searchResults) {
      loadMoreBooks();
    }
  }, [inView, hasMore, isLoading]);

  // Debounced search — fires 400ms after user stops typing
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounce.current = setTimeout(async () => {
      const results = await searchBooks(searchQuery.trim());
      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [searchQuery]);

  const handleGenreClick = async (genre: string) => {
    if (genre === selectedGenre || isLoading) return;
    setIsLoading(true);
    setSelectedGenre(genre);
    setPage(1);
    setBooks([]);
    setSearchQuery("");
    setSearchResults(null);
    const freshBooks = await getBooksByPage(1, genre, selectedSort);
    setBooks(freshBooks);
    setHasMore(freshBooks.length >= 12);
    setIsLoading(false);
  };

  const handleSortChange = async (sort: string) => {
    if (sort === selectedSort || isLoading) return;
    setIsLoading(true);
    setSelectedSort(sort);
    setPage(1);
    setBooks([]);
    const freshBooks = await getBooksByPage(1, selectedGenre, sort);
    setBooks(freshBooks);
    setHasMore(freshBooks.length >= 12);
    setIsLoading(false);
  };

  const loadMoreBooks = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const nextPage = page + 1;
    const nextBooks = await getBooksByPage(nextPage, selectedGenre, selectedSort);
    if (nextBooks && nextBooks.length > 0) {
      setBooks((prev) => [...prev, ...nextBooks]);
      setPage(nextPage);
      if (nextBooks.length < 12) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  const displayBooks = searchResults !== null ? searchResults : books;
  const isEmpty = displayBooks.length === 0 && !isLoading && !isSearching;

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, genre…"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-coffee-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-coffee-900 dark:text-slate-100 placeholder:text-coffee-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-coffee-300 dark:focus:ring-slate-700 transition-shadow"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setSearchResults(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-coffee-400 dark:text-slate-500 hover:text-coffee-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Genre pills + Sort — hidden during search */}
      {!searchQuery && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`snap-start whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedGenre === genre
                    ? "bg-coffee-800 dark:bg-slate-700 text-white shadow-md shadow-coffee-900/10 dark:shadow-none scale-105"
                    : "bg-white dark:bg-slate-900 text-coffee-600 dark:text-slate-400 border border-coffee-200 dark:border-slate-800 hover:border-coffee-400 dark:hover:border-slate-600 hover:bg-coffee-50 dark:hover:bg-slate-800"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {/* Sort options */}
          <div className="flex items-center gap-2 pb-4">
            <ArrowUpDown className="w-3.5 h-3.5 text-coffee-400 dark:text-slate-500 flex-shrink-0" />
            {[
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "az", label: "A–Z" },
              { key: "likes", label: "Most Liked" },
              { key: "saves", label: "Most Saved" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSortChange(key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSort === key
                    ? "bg-coffee-700 dark:bg-slate-700 text-white"
                    : "text-coffee-500 dark:text-slate-400 hover:bg-coffee-100 dark:hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results count */}
      {searchResults !== null && !isSearching && (
        <p className="text-sm text-coffee-500 dark:text-slate-400 mb-4">
          {searchResults.length === 0
            ? `No results for "${searchQuery}"`
            : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} for "${searchQuery}"`}
        </p>
      )}

      {/* Skeleton while loading / searching */}
      {(isLoading || isSearching) && displayBooks.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-coffee-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-coffee-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-coffee-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-coffee-400 dark:text-slate-500" />
          </div>
          <p className="text-coffee-600 dark:text-slate-300 font-bold text-lg">
            {searchResults !== null ? `No books match "${searchQuery}"` : "No books found in this genre."}
          </p>
          <p className="text-coffee-500 dark:text-slate-400 mt-2">
            {searchResults !== null ? "Try a different search term." : "Try selecting a different tag or check back later!"}
          </p>
        </div>
      )}

      {/* Book grid */}
      {displayBooks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 gap-4 min-h-[400px]">
          {displayBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger — only in browse mode */}
      {searchResults === null && hasMore && (
        <div ref={ref} className="w-full flex justify-center items-center mt-16 py-8">
          <Loader2 className="w-8 h-8 text-coffee-400 animate-spin" />
        </div>
      )}

      {searchResults === null && !hasMore && books.length > 0 && (
        <div className="w-full text-center mt-16 pb-8">
          <div className="w-16 h-0.5 bg-coffee-200 dark:bg-slate-800 mx-auto mb-6 rounded-full" />
          <p className="font-serif text-coffee-500 dark:text-slate-500 italic">You've reached the end of the library shelf.</p>
        </div>
      )}
    </>
  );
}
