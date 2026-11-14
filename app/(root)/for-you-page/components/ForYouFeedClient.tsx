"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinitePostFeed } from "@/components/feed/InfinitePostFeed";
import { useFeedQuery } from "@/hooks/queries/useFeed";

export function ForYouFeedClient() {
  const feedQuery = useFeedQuery("for-you");

  return (
    <InfinitePostFeed
      query={feedQuery}
      emptyIcon={<BookOpen className="w-6 h-6 stroke-[1.5]" />}
      emptyTitle="No stories in your feed yet"
      emptyDescription="Once writers publish new stories, they will be ranked here based on your interests and followed authors."
      emptyAction={
        <Link href="/write">
          <Button variant="primary" size="sm" className="rounded-full px-5 h-10">
            Write the first story
          </Button>
        </Link>
      }
      endMessage="You've reached the end of your curated feed."
    />
  );
}
