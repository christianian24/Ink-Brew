"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Feather, User } from "lucide-react";

const tabs = [
  { href: "/",        label: "Home",    icon: Home    },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/write",   label: "Write",   icon: Feather  },
  { href: "/profile", label: "Profile", icon: User     },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-coffee-200 dark:border-slate-800 bg-coffee-50/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors ${
                isActive
                  ? "text-coffee-900 dark:text-slate-50"
                  : "text-coffee-400 dark:text-slate-500 hover:text-coffee-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-semibold ${isActive ? "opacity-100" : "opacity-70"}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-2 w-1 h-1 rounded-full bg-coffee-700 dark:bg-slate-300" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
