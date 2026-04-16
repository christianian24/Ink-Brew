import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ink & Brew",
  description: "A cozy online library and writing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="min-h-full flex flex-col flex-1 text-coffee-950 bg-coffee-50 dark:bg-slate-950 dark:text-slate-100">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <MobileNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
