"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Search, Users, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/profile/FollowButton";
import {
  useUserFollowers,
  useUserFollowing,
} from "@/hooks/queries/useUserSocial";
import type { SocialUserItem } from "@/types/user";

interface FollowersDialogProps {
  targetUserId: string;
  targetUsername: string;
  initialTab?: "followers" | "following";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwnProfile?: boolean;
}

export function FollowersDialog({
  targetUserId,
  targetUsername,
  initialTab = "followers",
  open,
  onOpenChange,
  isOwnProfile = false,
}: FollowersDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"followers" | "following">(
    initialTab
  );
  const [filterQuery, setFilterQuery] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setFilterQuery("");
    }
  }, [open, initialTab]);

  const followersQuery = useUserFollowers(targetUserId);
  const followingQuery = useUserFollowing(targetUserId);

  const followers = React.useMemo(() => {
    const all = followersQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!filterQuery.trim()) return all;
    const q = filterQuery.toLowerCase();
    return all.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q)
    );
  }, [followersQuery.data, filterQuery]);

  const following = React.useMemo(() => {
    const all = followingQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!filterQuery.trim()) return all;
    const q = filterQuery.toLowerCase();
    return all.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q)
    );
  }, [followingQuery.data, filterQuery]);

  // Separate mutual followers ("Followed by you") on other users' profiles
  const { mutualFollowers, otherFollowers } = React.useMemo(() => {
    if (isOwnProfile) {
      return { mutualFollowers: [], otherFollowers: followers };
    }
    const mutuals: SocialUserItem[] = [];
    const others: SocialUserItem[] = [];
    for (const item of followers) {
      if (item.isMutual) {
        mutuals.push(item);
      } else {
        others.push(item);
      }
    }
    return { mutualFollowers: mutuals, otherFollowers: others };
  }, [followers, isOwnProfile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 font-sans overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <DialogTitle className="text-base font-semibold">
            @{targetUsername}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "followers" | "following")}
          className="w-full flex flex-col"
        >
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2 rounded-full h-9 bg-muted p-0.5">
              <TabsTrigger value="followers" className="rounded-full text-xs">
                Followers ({followersQuery.data?.pages[0]?.totalCount ?? 0})
              </TabsTrigger>
              <TabsTrigger value="following" className="rounded-full text-xs">
                Following ({followingQuery.data?.pages[0]?.totalCount ?? 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search people..."
                className="pl-9 h-9 text-xs rounded-full bg-secondary/50 border-border"
              />
            </div>
          </div>

          <div className="max-h-[360px] min-h-[220px] overflow-y-auto px-4 divide-y divide-border/60">
            <TabsContent value="followers" className="mt-0 focus-visible:outline-none">
              {followersQuery.isPending ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-xs">Loading followers...</p>
                </div>
              ) : followers.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-6 h-6 mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium">No followers found.</p>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {mutualFollowers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Followed by you
                      </p>
                      <div className="divide-y divide-border/50">
                        {mutualFollowers.map((user) => (
                          <UserListRow
                            key={user.id}
                            user={user}
                            isOwnProfile={isOwnProfile}
                            onNavigate={() => onOpenChange(false)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {otherFollowers.length > 0 && (
                    <div className="space-y-2">
                      {mutualFollowers.length > 0 && (
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                          All Followers
                        </p>
                      )}
                      <div className="divide-y divide-border/50">
                        {otherFollowers.map((user) => (
                          <UserListRow
                            key={user.id}
                            user={user}
                            isOwnProfile={isOwnProfile}
                            onNavigate={() => onOpenChange(false)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {followersQuery.hasNextPage && (
                    <div className="pt-2 pb-4 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={followersQuery.isFetchingNextPage}
                        onClick={() => followersQuery.fetchNextPage()}
                        className="text-xs text-muted-foreground rounded-full"
                      >
                        {followersQuery.isFetchingNextPage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : null}
                        Load more
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="mt-0 focus-visible:outline-none">
              {followingQuery.isPending ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-xs">Loading following...</p>
                </div>
              ) : following.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-6 h-6 mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium">Not following anyone yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50 py-2">
                  {following.map((user) => (
                    <UserListRow
                      key={user.id}
                      user={user}
                      isOwnProfile={isOwnProfile}
                      onNavigate={() => onOpenChange(false)}
                    />
                  ))}

                  {followingQuery.hasNextPage && (
                    <div className="pt-2 pb-4 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={followingQuery.isFetchingNextPage}
                        onClick={() => followingQuery.fetchNextPage()}
                        className="text-xs text-muted-foreground rounded-full"
                      >
                        {followingQuery.isFetchingNextPage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : null}
                        Load more
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserListRow({
  user,
  isOwnProfile,
  onNavigate,
}: {
  user: SocialUserItem;
  isOwnProfile: boolean;
  onNavigate: () => void;
}) {
  const isFollowBack = isOwnProfile && user.isFollowedBy && !user.isFollowing;

  return (
    <div className="flex items-center justify-between gap-3 py-3 font-sans">
      <Link
        href={`/users/${user.username}`}
        onClick={onNavigate}
        className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs text-foreground uppercase border border-border shrink-0">
            {user.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-xs text-foreground truncate">
              {user.name}
            </span>
            {isFollowBack && (
              <span className="px-1.5 py-0.2 rounded-full bg-secondary text-[10px] text-muted-foreground font-medium">
                Follows you
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground block truncate">
            @{user.username}
          </span>
        </div>
      </Link>

      <div className="shrink-0">
        <FollowButton
          targetUserId={user.id}
          targetUsername={user.username}
          initialIsFollowing={user.isFollowing}
          isSelf={user.isSelf}
          size="sm"
          className="text-xs h-7 px-3"
        />
      </div>
    </div>
  );
}
