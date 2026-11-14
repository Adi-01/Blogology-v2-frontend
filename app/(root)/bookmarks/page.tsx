import type { Metadata } from "next";
import { BookmarksClient } from "@/app/(root)/bookmarks/components/BookmarksClient";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Bookmarks — Blogology",
  description: "Stories you saved to read later.",
};

export default function BookmarksPage() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="border-b border-border pb-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Saved Stories
          </h1>
          <p className="font-serif text-base text-muted-foreground">
            Stories you bookmarked to read or revisit anytime.
          </p>
        </div>
      </header>

      <section>
        <BookmarksClient />
      </section>
    </div>
  );
}
