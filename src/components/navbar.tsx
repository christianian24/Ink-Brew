import Link from "next/link";
import { Coffee, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { auth, signOut } from "@/auth";
import NotificationBell from "./notification-bell";
import { getUnreadCount } from "@/app/actions/notifications";

export default async function Navbar() {
  const session = await auth();
  const unreadCount = session?.user?.id ? await getUnreadCount() : 0;

  // Derive initials for avatar
  const name = session?.user?.name ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-coffee-200 dark:border-slate-800 bg-coffee-50/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-coffee-600 dark:text-slate-400" />
          <span className="font-serif text-xl font-bold text-coffee-900 dark:text-slate-50">
            Ink &amp; Brew
          </span>
        </Link>
        <div className="ml-auto flex flex-1 items-center justify-end space-x-4">
          <Link href="/library" className="text-sm font-medium text-coffee-700 dark:text-slate-300 hover:text-coffee-950 dark:hover:text-slate-50 transition-colors">
            Library
          </Link>
          {session ? (
            <>
              <Link href="/write" className="text-sm font-medium text-coffee-700 dark:text-slate-300 hover:text-coffee-950 dark:hover:text-slate-50 transition-colors">
                Write
              </Link>
              <NotificationBell initialUnread={unreadCount} />
              {/* Avatar link */}
              <Link
                href="/profile"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-coffee-200 dark:bg-slate-700 text-coffee-800 dark:text-slate-200 text-xs font-bold hover:ring-2 hover:ring-coffee-400 dark:hover:ring-slate-500 transition-all overflow-hidden flex-shrink-0"
                title={name || "Profile"}
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </Link>
              {/* Settings dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-coffee-500 dark:text-slate-400 hover:bg-coffee-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-9 w-44 bg-white dark:bg-slate-900 border border-coffee-100 dark:border-slate-800 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto translate-y-1 group-hover:translate-y-0 transition-all duration-150 z-50 overflow-hidden">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-coffee-700 dark:text-slate-300 hover:bg-coffee-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </Link>
                  <div className="border-t border-coffee-100 dark:border-slate-800" />
                  <form action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-coffee-600 dark:bg-slate-800 hover:bg-coffee-700 dark:hover:bg-slate-700 text-white dark:text-slate-100 shadow-sm border border-transparent dark:border-slate-700">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
