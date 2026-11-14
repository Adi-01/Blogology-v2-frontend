"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinitePostFeed } from "@/components/feed/InfinitePostFeed";
import { useFeedQuery } from "@/hooks/queries/useFeed";
import { useUser } from "@/components/providers/user-provider";

export function ExploreFeedClient() {
  const { isGuest } = useUser();
  const feedQuery = useFeedQuery("explore");

  return (
    <InfinitePostFeed
      query={feedQuery}
      emptyIcon={<Compass className="w-6 h-6 stroke-[1.5]" />}
      emptyTitle={isGuest ? "No stories found yet" : "Nothing new outside your topics right now"}
      emptyDescription={
        isGuest
          ? "Check back soon as writers publish new stories across Blogology."
          : "All recent stories currently overlap with your saved interests. Check your For You feed or publish something fresh."
      }
      emptyAction={
        isGuest ? (
          <Link href="/signup">
            <Button variant="outline" size="sm" className="rounded-full px-5 h-10">
              Get started
            </Button>
          </Link>
        ) : (
          <Link href="/for-you-page">
            <Button variant="outline" size="sm" className="rounded-full px-5 h-10">
              Back to For You
            </Button>
          </Link>
        )
      }
      endMessage="You've explored all stories."
    />
  );
}
