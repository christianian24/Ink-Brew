import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Settings, LogOut, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      
      {/* Settings Header */}
      <div className="mb-12">
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-sm font-medium text-coffee-500 hover:text-coffee-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-coffee-100 dark:bg-slate-800 rounded-full">
            <Settings className="w-6 h-6 text-coffee-700 dark:text-slate-300" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-coffee-950 dark:text-slate-50">App Settings</h1>
        </div>
        <p className="mt-3 text-coffee-600 dark:text-slate-400">
          Manage your interface preferences and account configuration.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Appearance Section */}
        <section className="bg-white dark:bg-slate-900 border border-coffee-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-coffee-950 dark:text-slate-50 mb-6 font-serif">Appearance</h2>
          
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-coffee-100 dark:border-slate-800 pb-6">
              <div>
                <h3 className="font-semibold text-coffee-900 dark:text-slate-100">Global Theme</h3>
                <p className="text-sm text-coffee-500 dark:text-slate-400 mt-1">Select the color palette for the entire application.</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </section>

        {/* Account Settings Section (Placeholder for future) */}
        <section className="bg-white dark:bg-slate-900 border border-coffee-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm opacity-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-coffee-950 dark:text-slate-50 font-serif">Account</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-coffee-400 dark:text-slate-400 bg-coffee-100 dark:bg-slate-800 px-2 py-1 rounded">Coming Soon</span>
          </div>
          <p className="text-sm text-coffee-500 dark:text-slate-400 mb-6">
            Options to change your password, update your avatar, and manage privacy settings will be available here.
          </p>
        </section>

      </div>
    </div>
  );
}
