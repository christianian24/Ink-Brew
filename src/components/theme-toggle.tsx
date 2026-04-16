"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full flex gap-2 h-10 opacity-0" />
  }

  return (
    <div className="flex bg-coffee-100 dark:bg-slate-800 p-1 rounded-xl gap-1 max-w-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("light")}
        className={`flex-1 rounded-lg transition-all ${
          theme === "light" 
            ? "bg-white dark:bg-slate-900 shadow-sm text-coffee-900 dark:text-slate-50" 
            : "text-coffee-600 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-slate-100"
        }`}
      >
        <Sun className="w-4 h-4 mr-2" />
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("dark")}
        className={`flex-1 rounded-lg transition-all ${
          theme === "dark" 
            ? "bg-white dark:bg-slate-900 shadow-sm text-coffee-900 dark:text-slate-50" 
            : "text-coffee-600 dark:text-slate-400 hover:text-white"
        }`}
      >
        <Moon className="w-4 h-4 mr-2" />
        Dark
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("system")}
        className={`flex-1 rounded-lg transition-all ${
          theme === "system" 
            ? "bg-white dark:bg-slate-900 shadow-sm text-coffee-900 dark:text-slate-50" 
            : "text-coffee-600 dark:text-slate-400 hover:text-coffee-900 dark:hover:text-white"
        }`}
      >
        <Monitor className="w-4 h-4 mr-2" />
        System
      </Button>
    </div>
  )
}
