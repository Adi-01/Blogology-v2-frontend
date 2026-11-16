import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LandingActions } from "./LandingActions";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PostDetailMockup } from "@/components/landing/PostDetailMockup";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blogology — Where Ideas Breathe. Where Writing Endures.",
  description:
    "A black-and-white editorial publication platform where typography speaks clearly, thoughts aren't hurried, and deep thinking finds its readers.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      {/* Top sticky glass navigation */}
      <LandingHeader />

      <main className="flex-1">
        {/* 1. Hero Section (Clean, without any badge) */}
        <section className="relative px-4 sm:px-6 pt-16 sm:pt-24 md:pt-28 pb-12 sm:pb-16 max-w-5xl mx-auto text-center">
          <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
            {/* Monumental Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-foreground leading-[1.08] animate-fade-up">
              Where words carry weight.
            </h1>

            {/* Editorial Standfirst */}
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-reading mx-auto animate-fade-up animation-delay-100">
              A black-and-white publication space for thoughtful essays, deep technical dives, and timeless writing—free from algorithmic clutter and digital noise.
            </p>

            {/* Primary Action Buttons (Server-rendered via Suspense) */}
            <div className="pt-2 animate-fade-up animation-delay-200">
              <Suspense
                fallback={
                  <div className="h-12 w-64 rounded-full bg-muted/40 animate-pulse mx-auto" />
                }
              >
                <LandingActions />
              </Suspense>
            </div>
          </div>
        </section>

        {/* 2. Detailed Post Section showing posts/[id] UI with dummy data */}
        <section className="px-4 sm:px-6 pb-20 sm:pb-28 max-w-5xl mx-auto">
          <PostDetailMockup />
        </section>

        {/* 3. The Reading Manifesto Section */}
        <section
          id="manifesto"
          className="border-y border-border bg-card px-4 sm:px-6 py-20 sm:py-28 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="inline-block text-2xl text-foreground font-serif">“</span>
            <blockquote className="font-display italic text-2xl sm:text-3xl md:text-4xl text-foreground leading-snug">
              In an internet overwhelmed by fleeting reaction and shallow summaries, the written word remains our most durable vehicle for truth. Blogology is built for those who take time to write with rigor and read with depth.
            </blockquote>
            <div className="pt-4">
              <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground font-medium">
                The Blogology Manifesto
              </p>
            </div>
          </div>
        </section>

        {/* 4. Second Last Call to Action */}
        <section className="px-4 sm:px-6 py-20 sm:py-28 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-14 md:p-16 text-center space-y-6 shadow-soft hover:shadow-lift transition-all duration-300">
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.15]">
              Your thoughts deserve a permanent home.
            </h2>

            <p className="font-serif text-base sm:text-lg md:text-xl text-muted-foreground max-w-reading mx-auto leading-relaxed">
              Whether you are an architect designing distributed backends or a writer exploring culture, publish where ideas are celebrated for their substance.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full cursor-pointer hover:opacity-90"
                >
                  Start writing today
                </Button>
              </Link>
              <Link href="/explore" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full cursor-pointer hover:bg-secondary/70 transition-colors"
                >
                  Browse stories
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Editorial Footer */}
      <footer className="border-t border-border bg-card py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-foreground"
            >
              Blogology
            </Link>
            <p className="font-serif text-xs text-muted-foreground leading-relaxed">
              A black-and-white editorial blogging platform where ideas find their readers.
            </p>
          </div>

          {/* Column 2: Discover */}
          <div className="space-y-3 text-xs font-sans">
            <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Discover
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/explore" className="hover:text-foreground transition-colors">
                  Explore feed
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  Search archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Publishing */}
          <div className="space-y-3 text-xs font-sans">
            <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
              Publishing
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/write" className="hover:text-foreground transition-colors">
                  Post editor
                </Link>
              </li>
              <li>
                <a href="#manifesto" className="hover:text-foreground transition-colors">
                  Editorial manifesto
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-muted-foreground">
          <p>© 2026 Blogology. All rights reserved.</p>
          <p className="text-[11px]">Crafted with intention and pure typography.</p>
        </div>
      </footer>
    </div>
  );
}
