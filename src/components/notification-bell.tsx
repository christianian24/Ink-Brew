"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { getNotifications, markAllRead, markOneRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
};

export default function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data as Notification[]);
    setLoaded(true);
  };

  const handleOpen = () => {
    if (!isOpen && !loaded) loadNotifications();
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      router.refresh();
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#notification-bell")) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div id="notification-bell" className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-coffee-600 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-slate-100 hover:bg-coffee-100 dark:hover:bg-slate-800 transition-colors"
        aria-label={`${unread} unread notifications`}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[480px] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-coffee-100 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in duration-150">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 px-4 py-3 border-b border-coffee-100 dark:border-slate-800 flex items-center justify-between z-10">
            <span className="font-bold text-coffee-900 dark:text-slate-50 text-sm">Notifications</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="flex items-center gap-1 text-xs text-coffee-500 dark:text-slate-400 hover:text-coffee-800 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {!loaded ? (
            <div className="p-6 text-center text-coffee-400 dark:text-slate-500 text-sm">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-coffee-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-coffee-500 dark:text-slate-400">No notifications yet.</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => {
                    setIsOpen(false);
                    if (!n.read) {
                      markOneRead(n.id);
                      setNotifications((prev) =>
                        prev.map((notif) => notif.id === n.id ? { ...notif, read: true } : notif)
                      );
                      setUnread((prev) => Math.max(0, prev - 1));
                    }
                  }}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-coffee-50 dark:border-slate-800/50 hover:bg-coffee-50 dark:hover:bg-slate-800/50 transition-colors ${
                    !n.read ? "bg-coffee-50/80 dark:bg-slate-800/40" : ""
                  }`}
                >
                  {/* Unread dot */}
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? "bg-coffee-500 dark:bg-slate-400" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-coffee-800 dark:text-slate-200 leading-snug">{n.message}</p>
                    <p className="text-xs text-coffee-400 dark:text-slate-500 mt-0.5">{formatTime(n.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
