"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-soft"
          : "bg-background/40 backdrop-blur-xs border-b border-border/40"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground hover:opacity-85 transition-opacity"
        >
          Blogology
        </Link>

        {/* Center navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-sans text-muted-foreground">
          <Link
            href="/explore"
            className="hover:text-foreground transition-colors"
          >
            Stories
          </Link>
          <a
            href="#manifesto"
            className="hover:text-foreground transition-colors"
          >
            Manifesto
          </a>
          <Link
            href="/search"
            className="hover:text-foreground transition-colors"
          >
            Search
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-9 px-4 rounded-full text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 px-4 rounded-full font-sans border-border hover:bg-secondary/70"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
