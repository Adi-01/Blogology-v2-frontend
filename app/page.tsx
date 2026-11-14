import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingActions } from "./LandingActions";

export const metadata: Metadata = {
  title: "Blogology — A Thoughtful Editorial Platform",
  description: "A black-and-white editorial blogging platform where ideas find their readers.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
            The Editorial Blogging Platform
          </span>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
            Blogology
          </h1>
          <p className="mx-auto max-w-lg font-serif text-lg leading-relaxed text-muted-foreground md:text-xl">
            A quiet space where words carry weight, typography speaks clearly, and ideas find thoughtful readers.
          </p>
        </div>

        <div className="pt-4">
          <Suspense
            fallback={
              <div className="h-12 w-64 rounded-full bg-muted/40 animate-pulse mx-auto" />
            }
          >
            <LandingActions />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
