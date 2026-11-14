import type { Metadata } from "next";
import { ExploreFeedClient } from "@/app/(root)/explore/components/ExploreFeedClient";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";
export const instant = false;

export const metadata: Metadata = {
  title: "Explore — Blogology",
  description:
    "Discover new topics, writers, and diverse perspectives outside your feed.",
};

export default function ExplorePage() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="border-b border-border pb-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Explore
          </h1>
          <p className="font-serif text-base text-muted-foreground">
            Discover thoughtful stories and perspectives outside your usual
            topics.
          </p>
        </div>
      </header>
      <section>
        <ExploreFeedClient />
      </section>
    </div>
  );
}
