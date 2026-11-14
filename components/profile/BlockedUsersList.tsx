"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlockedUsers } from "@/hooks/queries/useUserSocial";
import { useToggleBlockMutation } from "@/hooks/mutations/useUserMutations";
import { useUser } from "@/components/providers/user-provider";

export function BlockedUsersList() {
  const { user } = useUser();
  const { data: serverBlockedUsers, isPending, isError } = useBlockedUsers(user?.id);
  const [removedIds, setRemovedIds] = React.useState<Set<string>>(new Set());

  // Filter out any IDs unblocked during this session immediately
  const blockedUsers = React.useMemo(() => {
    if (!serverBlockedUsers) return [];
    return serverBlockedUsers.filter((u) => !removedIds.has(u.id));
  }, [serverBlockedUsers, removedIds]);

  const handleUnblockLocal = (id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  if (isPending) {
    return (
      <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground text-xs font-sans">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading blocked accounts...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-xs text-destructive font-sans">
        Unable to load blocked accounts.
      </div>
    );
  }

  if (blockedUsers.length === 0) {
    return (
      <div className="py-10 text-center border border-dashed border-border rounded-xl font-sans my-2">
        <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60 stroke-[1.5]" />
        <p className="text-xs font-medium text-foreground">
          No blocked accounts
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          You have not blocked any users.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border max-h-[360px] overflow-y-auto px-1 font-sans">
      {blockedUsers.map((blocked) => (
        <BlockedUserRow
          key={blocked.id}
          blockedUser={blocked}
          onUnblocked={() => handleUnblockLocal(blocked.id)}
        />
      ))}
    </div>
  );
}

function BlockedUserRow({
  blockedUser,
  onUnblocked,
}: {
  blockedUser: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
    blockedAt: string;
  };
  onUnblocked: () => void;
}) {
  const blockMutation = useToggleBlockMutation(blockedUser.id);

  const handleUnblock = () => {
    // 100% Optimistic: Immediately trigger parent filter
    onUnblocked();
    blockMutation.mutate(true);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <Link
        href={`/users/${blockedUser.username}`}
        className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
      >
        {blockedUser.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blockedUser.avatar}
            alt={blockedUser.name}
            className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs text-foreground uppercase border border-border shrink-0">
            {blockedUser.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <div className="font-medium text-xs text-foreground truncate hover:underline">
            {blockedUser.name}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            @{blockedUser.username}
          </div>
        </div>
      </Link>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleUnblock}
        className="rounded-full h-7 px-3 text-xs gap-1.5 shrink-0 hover:border-destructive hover:text-destructive cursor-pointer"
      >
        <UserX className="w-3 h-3" />
        <span>Unblock</span>
      </Button>
    </div>
  );
}
