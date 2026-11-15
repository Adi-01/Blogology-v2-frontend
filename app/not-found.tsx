import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: "404 — Page Not Found · Blogology",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Main 404 Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Lost between the lines
            </h1>
            <p className="mx-auto max-w-reading font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The story, writer, or page you were looking for doesn&apos;t
              exist, has been unpublished, or may have moved to a new address.
            </p>
          </div>

          {/* Action buttons (One primary, others outline) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto h-11 px-6 rounded-full font-sans text-sm gap-2"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                Return home
              </Button>
            </Link>
            <Link href="/explore" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 px-6 rounded-full font-sans text-sm gap-2"
              >
                <Compass className="w-4 h-4" strokeWidth={1.5} />
                Explore stories
              </Button>
            </Link>
          </div>
        </div>
      </main>

      
    </div>
  );
}
