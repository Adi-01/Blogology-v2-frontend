"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/user-provider";
import { useToggleFollowMutation } from "@/hooks/mutations/useUserMutations";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  initialIsFollowing?: boolean;
  initialFollowersCount?: number;
  size?: "default" | "sm";
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onFollowChange?: (isFollowing: boolean, followersCount?: number) => void;
  isSelf?: boolean;
}

export function FollowButton({
  targetUserId,
  targetUsername,
  initialIsFollowing = false,
  initialFollowersCount,
  size = "sm",
  variant = "outline",
  className,
  onFollowChange,
  isSelf,
}: FollowButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest } = useUser();
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing);

  // Sync state if initial prop changes
  React.useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const followMutation = useToggleFollowMutation(targetUserId);

  // Do not show follow button for self
  if (isSelf || (user && user.id === targetUserId)) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Guest prompt
    if (isGuest || !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const nextState = !isFollowing;
    // 100% Optimistic: Immediately flip local state & parent counter
    setIsFollowing(nextState);
    onFollowChange?.(nextState);

    followMutation.mutate(isFollowing, {
      onSuccess: (res) => {
        if (res.success && res.isFollowing !== undefined) {
          setIsFollowing(res.isFollowing);
          onFollowChange?.(res.isFollowing, res.followersCount);
        } else {
          // Rollback on error
          setIsFollowing(!nextState);
          onFollowChange?.(!nextState);
        }
      },
      onError: () => {
        setIsFollowing(!nextState);
        onFollowChange?.(!nextState);
      },
    });
  };

  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      onClick={handleClick}
      aria-label={
        isFollowing
          ? `Following ${targetUsername ?? "user"}`
          : `Follow ${targetUsername ?? "user"}`
      }
      className={cn(
        "rounded-full transition-colors font-sans font-medium select-none text-xs h-7 px-3 cursor-pointer",
        className,
      )}
    >
      {isFollowing ? (
        <span className="inline-flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Following
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <UserPlus className="w-3 h-3" />
          Follow
        </span>
      )}
    </Button>
  );
}
