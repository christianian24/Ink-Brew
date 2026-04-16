"use client";

import { useState, useEffect } from "react";
import { syncReadingProgress, getReadingProgress } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import { Settings2, Moon, Sun, Type, Minus, Plus } from "lucide-react";

interface ReaderEngineProps {
  chapterId: string;
  content: string;
  title: string;
}

export default function ReaderEngine({ chapterId, content, title }: ReaderEngineProps) {
  const [fontFamily, setFontFamily] = useState<"font-serif" | "font-sans">("font-serif");
  const [sizeLevel, setSizeLevel] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [readPercent, setReadPercent] = useState(0);

  // Map integer to Tailwind classes
  const fontSizes = ["text-base", "text-lg", "text-xl", "text-2xl"];
  
  useEffect(() => {
    // Load previous preferences from localStorage
    const savedFont = localStorage.getItem("reader-font") as any;
    const savedSize = localStorage.getItem("reader-size");
    if (savedFont) setFontFamily(savedFont);
    if (savedSize) setSizeLevel(parseInt(savedSize));

    // Bug 1 fix: restore saved scroll position, then begin syncing
    getReadingProgress(chapterId).then((savedPosition) => {
      if (savedPosition && savedPosition > 100) {
        // Slight delay so the page finishes rendering before scrolling
        setTimeout(() => window.scrollTo({ top: savedPosition, behavior: "smooth" }), 200);
      }
      // Start the initial sync from wherever we are
      syncReadingProgress(chapterId, savedPosition ?? Math.round(window.scrollY));
    });

    // Scroll position tracking — throttled to avoid excessive writes
    let latestScrollY = Math.round(window.scrollY);
    const handleScroll = () => {
      latestScrollY = Math.round(window.scrollY);
      // Update progress bar
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadPercent(docHeight > 0 ? Math.min(100, Math.round((latestScrollY / docHeight) * 100)) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Sync every 10 seconds
    const intervalId = setInterval(() => {
      syncReadingProgress(chapterId, latestScrollY);
    }, 10_000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(intervalId);
      syncReadingProgress(chapterId, latestScrollY);
    };
  }, [chapterId]);

  const toggleFont = () => {
    const next = fontFamily === "font-serif" ? "font-sans" : "font-serif";
    setFontFamily(next);
    localStorage.setItem("reader-font", next);
  };

  const adjustSize = (increment: number) => {
    const next = Math.max(0, Math.min(3, sizeLevel + increment));
    setSizeLevel(next);
    localStorage.setItem("reader-size", String(next));
  };

  return (
    <div className="transition-colors duration-500 w-full rounded-2xl bg-transparent">
      {/* Reading progress bar — fixed at very top of viewport */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-coffee-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-coffee-400 to-coffee-700 dark:from-slate-500 dark:to-slate-300 transition-[width] duration-150 ease-linear"
          style={{ width: `${readPercent}%` }}
        />
      </div>
      
      <div className={`space-y-4 mb-16 text-center text-coffee-950 dark:text-slate-50 ${fontFamily}`}>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {title}
        </h1>
        <div className="w-16 h-0.5 mx-auto rounded-full bg-coffee-300 dark:bg-slate-700" />
      </div>

      {/* The Core Text Renderer */}
      <article 
        className={`
          max-w-none 
          prose 
          prose-coffee dark:prose-invert prose-p:text-coffee-800 dark:prose-p:text-slate-300
          ${fontFamily} 
          ${fontSizes[sizeLevel]}
          leading-relaxed md:leading-loose
          transition-all duration-300
        `}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Floating Action Menu (Mobile Optimized) */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-end gap-3">
        
        {/* Popover Settings Panel */}
        {isMenuOpen && (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-coffee-100 dark:border-slate-800 mb-2 w-64 animate-in slide-in-from-bottom-5 fade-in duration-200 origin-bottom-right">
            
            <div className="space-y-4">
              {/* Font Type Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-coffee-900 dark:text-slate-100">Typeface</span>
                <button 
                  onClick={toggleFont}
                  className="px-3 py-1 bg-coffee-100 dark:bg-slate-800 hover:bg-coffee-200 dark:hover:bg-slate-700 rounded-full text-xs font-bold text-coffee-800 dark:text-slate-200 transition-colors"
                >
                  {fontFamily === 'font-serif' ? 'Serif' : 'Sans'}
                </button>
              </div>

              {/* Font Size Adjuster */}
              <div className="flex items-center justify-between border-t border-coffee-200/50 dark:border-slate-800/50 pt-4">
                <span className="text-sm font-semibold text-coffee-900 dark:text-slate-100">Size</span>
                <div className="flex items-center gap-1 bg-coffee-100 dark:bg-slate-800 rounded-full p-1">
                  <button 
                    onClick={() => adjustSize(-1)} 
                    disabled={sizeLevel === 0}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30 text-coffee-700 dark:text-slate-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold font-mono w-6 text-center text-coffee-900 dark:text-slate-100">{sizeLevel + 1}</span>
                  <button 
                    onClick={() => adjustSize(1)} 
                    disabled={sizeLevel === 3}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30 text-coffee-700 dark:text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <Button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${isMenuOpen ? "bg-coffee-900 dark:bg-slate-800 hover:bg-coffee-950 dark:hover:bg-slate-700" : "bg-coffee-800 dark:bg-slate-800 hover:bg-coffee-900 dark:hover:bg-slate-700 hover:scale-105"} text-white border-4 border-white/20 dark:border-slate-900/50`}
        >
          {isMenuOpen ? <Type className="w-6 h-6" /> : <Settings2 className="w-6 h-6" />}
        </Button>
      </div>
      
    </div>
  );
}
