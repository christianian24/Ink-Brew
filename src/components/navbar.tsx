import Link from "next/link";
import { Coffee, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-coffee-200 bg-coffee-50/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-coffee-600" />
          <span className="font-serif text-xl font-bold text-coffee-900">
            Ink & Brew
          </span>
        </Link>
        <div className="ml-auto flex flex-1 items-center justify-end space-x-4">
          <Link href="/library" className="text-sm font-medium text-coffee-700 hover:text-coffee-950">
            Library
          </Link>
          {session ? (
            <>
              <Link href="/write" className="text-sm font-medium text-coffee-700 hover:text-coffee-950">
                Write
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-coffee-700">
                  Profile
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-coffee-600 hover:bg-coffee-700 text-white shadow-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
