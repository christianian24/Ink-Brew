import Link from "next/link";
import { BookOpen, Coffee, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 px-4 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-coffee-950 tracking-tight">
          Your Cozy Corner for <br className="hidden md:block" />
          <span className="text-coffee-600 italic">Reading & Writing</span>
        </h1>
        <p className="text-lg text-coffee-700 max-w-2xl mx-auto leading-relaxed">
          Welcome to Ink & Brew. Grab a virtual coffee, explore a library of independent novels,
          or start writing your own masterpiece in our distraction-free editor.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/library">
            <Button size="lg" className="gap-2 bg-coffee-800 hover:bg-coffee-900 border-none">
              <BookOpen className="w-5 h-5" />
              Browse Library
            </Button>
          </Link>
          <Link href="/write">
            <Button size="lg" variant="outline" className="gap-2">
              <Feather className="w-5 h-5" />
              Start Writing
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="grid md:grid-cols-3 gap-8 max-w-5xl w-full pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-coffee-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-coffee-50 rounded-full flex items-center justify-center text-coffee-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-coffee-900">Curated Library</h3>
          <p className="text-coffee-600 text-sm">Discover stories from upcoming authors across all genres in a beautiful reading environment.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-coffee-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-coffee-50 rounded-full flex items-center justify-center text-coffee-600">
            <Feather className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-coffee-900">Distraction-Free Editor</h3>
          <p className="text-coffee-600 text-sm">Draft your chapters with autosave and simple formatting right from your browser.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-coffee-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-coffee-50 rounded-full flex items-center justify-center text-coffee-600">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-coffee-900">Coffee Shop Vibe</h3>
          <p className="text-coffee-600 text-sm">Enjoy a warm, minimalistic paper-like UI that makes reading and writing a pleasure.</p>
        </div>
      </section>
    </div>
  );
}
