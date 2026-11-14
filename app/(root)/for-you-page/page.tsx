import type { Metadata } from "next";
import { ForYouFeedClient } from "@/app/(root)/for-you-page/components/ForYouFeedClient";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";

export const instant = false

export const metadata: Metadata = {
  title: "For You — Blogology",
  description: "Your personalized editorial story feed.",
};

export default function ForYouPage() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="border-b border-border pb-6">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            For you
          </h1>
          <p className="font-serif text-base text-muted-foreground">
            Stories curated based on your reading interests and the writers you follow.
          </p>
        </div>
      </header>

      <section>
        <ForYouFeedClient />
      </section>
    </div>
  );
}
