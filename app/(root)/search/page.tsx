import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchBar } from "@/components/search/SearchBar";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";
export const instant = false

export const metadata: Metadata = {
  title: "Search — Blogology",
  description: "Search published stories and writers on Blogology.",
};

export default function SearchPage() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="border-b border-border pb-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Search
          </h1>
          <p className="font-serif text-base text-muted-foreground">
            Find stories by title or content, or look up writers by name or username.
          </p>
        </div>
      </header>

      <section>
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="h-11 flex-1 rounded-full bg-muted/50 animate-pulse" />
                <div className="h-11 w-36 rounded-full bg-muted/40 animate-pulse" />
              </div>
            </div>
          }
        >
          <SearchBar />
        </Suspense>
      </section>
    </div>
  );
}
