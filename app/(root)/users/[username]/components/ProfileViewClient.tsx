"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostFeedCard } from "@/components/feed/PostFeedCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FollowButton } from "@/components/profile/FollowButton";
import { BlockButton } from "@/components/profile/BlockButton";
import { FollowersDialog } from "@/components/profile/FollowersDialog";
import { useAuthorPosts } from "@/hooks/queries/useUserSocial";
import type { AuthorPublicProfile } from "@/types/user";
import type { CursorFeedResponse } from "@/types/post";

interface ProfileViewClientProps {
  initialProfile: AuthorPublicProfile;
  initialPosts: CursorFeedResponse;
  currentUserId?: string;
}

export function ProfileViewClient({
  initialProfile,
  initialPosts,
  currentUserId,
}: ProfileViewClientProps) {
  const profile = initialProfile;
  const isOwnProfile = profile.isSelf || currentUserId === profile.id;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTab, setDialogTab] = React.useState<"followers" | "following">(
    "followers"
  );
  const [followersCount, setFollowersCount] = React.useState(
    profile.followersCount
  );
  const [isFollowing, setIsFollowing] = React.useState(profile.isFollowing);
  const [isBlocked, setIsBlocked] = React.useState(profile.isBlocked);

  const postsQuery = useAuthorPosts(profile.username, initialPosts);

  const posts = React.useMemo(() => {
    const all = postsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    const seen = new Set<string>();
    return all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [postsQuery.data]);

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const openFollowers = () => {
    setDialogTab("followers");
    setDialogOpen(true);
  };

  const openFollowing = () => {
    setDialogTab("following");
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Main Profile Canvas (Using only root WorkspaceShell navbar & sidebar) */}
      <main className="max-w-4xl mx-auto px-6 py-10 md:py-14 space-y-10">
        {/* Author Bio Header Card */}
        <section className="space-y-6 border-b border-border pb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-border shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary flex items-center justify-center font-bold text-2xl text-foreground uppercase border-2 border-border shrink-0">
                  {profile.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                  {profile.name}
                </h1>
                <p className="text-sm text-muted-foreground font-sans">
                  @{profile.username}
                </p>

                {joinedDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {joinedDate}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center">
              {isOwnProfile ? (
                <Link href="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-9 px-4 text-xs gap-1.5 font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit profile
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <FollowButton
                    targetUserId={profile.id}
                    targetUsername={profile.username}
                    initialIsFollowing={isFollowing}
                    size="default"
                    className="h-9 px-4"
                    onFollowChange={(newIsFollowing, count) => {
                      setIsFollowing(newIsFollowing);
                      setFollowersCount((prev) =>
                        count !== undefined
                          ? count
                          : newIsFollowing
                          ? prev + 1
                          : Math.max(0, prev - 1)
                      );
                    }}
                  />
                  <BlockButton
                    targetUserId={profile.id}
                    targetUsername={profile.username}
                    initialIsBlocked={isBlocked}
                    size="default"
                    className="h-9 px-3"
                    onBlockChange={(newIsBlocked) => {
                      setIsBlocked(newIsBlocked);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Author Bio */}
          {profile.bio && (
            <p className="font-serif text-base sm:text-lg text-foreground/90 leading-relaxed max-w-2xl pt-1">
              {profile.bio}
            </p>
          )}

          {/* Follower / Following Stats (Clickable) */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-sans">
            <button
              type="button"
              onClick={openFollowers}
              className="group flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
            >
              <span className="font-semibold text-foreground group-hover:underline">
                {followersCount}
              </span>
              <span>{followersCount === 1 ? "follower" : "followers"}</span>
            </button>

            <span className="text-muted-foreground/40">·</span>

            <button
              type="button"
              onClick={openFollowing}
              className="group flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer text-muted-foreground"
            >
              <span className="font-semibold text-foreground group-hover:underline">
                {profile.followingCount}
              </span>
              <span>following</span>
            </button>

            <span className="text-muted-foreground/40">·</span>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">
                {profile.postsCount}
              </span>
              <span>{profile.postsCount === 1 ? "story" : "stories"}</span>
            </div>
          </div>
        </section>

        {/* Stories Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Stories by {profile.name}
            </h2>
          </div>

          {posts.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-7 h-7 stroke-[1.5]" />}
              title="No published stories"
              description={`@${profile.username} hasn't published any stories yet.`}
            />
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <PostFeedCard key={post.id} post={post} hideAuthor />
              ))}
            </div>
          )}

          {postsQuery.hasNextPage && (
            <div className="pt-4 pb-8 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={postsQuery.isFetchingNextPage}
                onClick={() => postsQuery.fetchNextPage()}
                className="rounded-full px-6 h-9 text-xs font-medium gap-2"
              >
                {postsQuery.isFetchingNextPage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                <span>
                  {postsQuery.isFetchingNextPage
                    ? "Loading stories…"
                    : "Load more stories"}
                </span>
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Followers & Following Modal */}
      <FollowersDialog
        targetUserId={profile.id}
        targetUsername={profile.username}
        initialTab={dialogTab}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
