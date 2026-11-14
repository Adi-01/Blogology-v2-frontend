"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinitePostFeed } from "@/components/feed/InfinitePostFeed";
import { useBookmarksQuery } from "@/hooks/queries/useBookmarks";

export function BookmarksClient() {
  const bookmarksQuery = useBookmarksQuery();

  return (
    <InfinitePostFeed
      query={bookmarksQuery}
      emptyIcon={<Bookmark className="w-6 h-6 text-muted-foreground" />}
      emptyTitle="No saved stories yet"
      emptyDescription="Bookmark stories while reading and they will appear here for quick access."
      emptyAction={
        <Link href="/explore">
          <Button variant="primary" size="sm" className="rounded-full px-5">
            Explore stories
          </Button>
        </Link>
      }
      endMessage="You've seen all your saved stories."
    />
  );
}
