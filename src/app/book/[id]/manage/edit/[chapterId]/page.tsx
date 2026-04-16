import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ChapterEditForm from "@/components/chapter-edit-form";

export const dynamic = "force-dynamic";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id: bookId, chapterId } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, authorId: true, title: true },
  });
  if (!book) notFound();
  if (book.authorId !== session.user.id) redirect(`/book/${bookId}`);

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, title: true, content: true, bookId: true },
  });
  if (!chapter || chapter.bookId !== bookId) notFound();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link href={`/book/${bookId}/manage`}>
          <Button variant="ghost" className="gap-2 text-coffee-600 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-slate-100 border border-transparent hover:border-coffee-200 dark:hover:border-slate-700">
            <ChevronLeft className="w-4 h-4" /> Back to Manage
          </Button>
        </Link>
        <span className="text-sm font-medium text-coffee-400 dark:text-slate-400 bg-coffee-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Editing Chapter
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-coffee-950 dark:text-slate-50">{book.title}</h1>
        <p className="text-coffee-500 dark:text-slate-400 mt-1">Editing: {chapter.title}</p>
      </div>

      <ChapterEditForm
        bookId={bookId}
        chapterId={chapterId}
        initialTitle={chapter.title}
        initialContent={chapter.content}
      />
    </div>
  );
}
