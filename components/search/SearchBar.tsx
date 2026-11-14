"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, Users, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfinitePostFeed } from "@/components/feed/InfinitePostFeed";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserSearchCard } from "@/components/search/UserSearchCard";
import {
  useSearchPostsQuery,
  useSearchUsersQuery,
} from "@/hooks/queries/useSearch";
import type { SearchTab } from "@/types/search";

export function SearchBar() {
  const searchParams = useSearchParams();

  const initialQuery = (searchParams.get("q") ?? "").trim();
  const initialTab: SearchTab =
    searchParams.get("tab") === "users" ? "users" : "posts";

  const [inputValue, setInputValue] = React.useState(initialQuery);
  const [activeQuery, setActiveQuery] = React.useState(initialQuery);
  const [tab, setTab] = React.useState<SearchTab>(initialTab);

  const syncUrl = React.useCallback((query: string, nextTab: SearchTab) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextTab !== "posts") params.set("tab", nextTab);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/search?${qs}` : "/search");
  }, []);

  const postsQuery = useSearchPostsQuery(activeQuery, tab === "posts");
  const usersQuery = useSearchUsersQuery(activeQuery, tab === "users");

  const usersItems = React.useMemo(() => {
    const all = usersQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const seen = new Set<string>();
    return all.filter((person) => {
      if (seen.has(person.id)) return false;
      seen.add(person.id);
      return true;
    });
  }, [usersQuery.data]);

  const applySearch = (rawQuery: string, nextTab: SearchTab) => {
    const trimmed = rawQuery.trim();
    syncUrl(trimmed, nextTab);
    setActiveQuery(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch(inputValue, tab);
  };

  const handleTabChange = (nextTab: SearchTab) => {
    if (nextTab === tab) return;
    setTab(nextTab);
    applySearch(inputValue, nextTab);
  };

  const handleClear = () => {
    setInputValue("");
    applySearch("", tab);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              tab === "posts"
                ? "Search stories by title or topic…"
                : "Search writers by username…"
            }
            aria-label="Search Blogology"
            className="h-11 rounded-full pl-11 pr-24 bg-background border-border"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-16 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-8 px-3.5 text-xs"
          >
            Go
          </Button>
        </div>

        <div
          role="tablist"
          aria-label="Search type"
          className="inline-flex rounded-full border border-border bg-secondary/40 p-1 self-start sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "posts"}
            onClick={() => handleTabChange("posts")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              tab === "posts"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "users"}
            onClick={() => handleTabChange("users")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              tab === "users"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            People
          </button>
        </div>
      </form>

      {!activeQuery ? (
        <EmptyState
          icon={<Search className="w-6 h-6 stroke-[1.5]" />}
          title="Search stories and writers"
          description="Enter a keyword above to search published stories by title or body text, or switch to People to find authors by username."
        />
      ) : tab === "posts" ? (
        <InfinitePostFeed
          query={postsQuery}
          enabled={tab === "posts" && activeQuery.length > 0}
          emptyIcon={<FileText className="w-6 h-6 stroke-[1.5]" />}
          emptyTitle={`No stories matched "${activeQuery}"`}
          emptyDescription="Try another keyword, check your spelling, or switch to the People tab."
          endMessage={`End of story results for "${activeQuery}".`}
        />
      ) : usersQuery.isPending ? (
        <div className="divide-y divide-border/70">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4 py-5">
              <div className="w-12 h-12 rounded-full bg-muted/50 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 rounded-md bg-muted/50 animate-pulse" />
                <div className="h-3.5 w-24 rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-3/4 rounded-md bg-muted/40 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : usersQuery.isError ? (
        <EmptyState
          icon={<AlertCircle className="w-6 h-6 stroke-[1.5]" />}
          title="Unable to search people"
          description={
            usersQuery.error instanceof Error
              ? usersQuery.error.message
              : "Something went wrong while searching users."
          }
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => usersQuery.refetch()}
              className="rounded-full px-5 h-10"
            >
              Try again
            </Button>
          }
        />
      ) : usersItems.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 stroke-[1.5]" />}
          title={`No writers matched "@${activeQuery}"`}
          description="Try searching with part of a username or switch to Posts to search story titles and content."
        />
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-border">
            {usersItems.map((person) => (
              <UserSearchCard key={person.id} user={person} />
            ))}
          </div>

          <div className="pt-2 pb-8 flex justify-center">
            {usersQuery.hasNextPage ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={usersQuery.isFetchingNextPage}
                onClick={() => usersQuery.fetchNextPage()}
                className="rounded-full px-6 h-10 text-xs font-medium gap-2"
              >
                {usersQuery.isFetchingNextPage && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>
                  {usersQuery.isFetchingNextPage
                    ? "Loading writers…"
                    : "Load more people"}
                </span>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground font-sans">
                End of people results for &ldquo;{activeQuery}&rdquo;.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
