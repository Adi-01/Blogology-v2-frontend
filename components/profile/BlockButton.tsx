"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Ban, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@/components/providers/user-provider";
import { useToggleBlockMutation } from "@/hooks/mutations/useUserMutations";
import { cn } from "@/lib/utils";

interface BlockButtonProps {
  targetUserId: string;
  targetUsername?: string;
  initialIsBlocked?: boolean;
  size?: "default" | "sm";
  variant?: "ghost" | "outline" | "destructive";
  className?: string;
  onBlockChange?: (isBlocked: boolean) => void;
  isSelf?: boolean;
}

export function BlockButton({
  targetUserId,
  targetUsername = "this user",
  initialIsBlocked = false,
  size = "sm",
  variant = "ghost",
  className,
  onBlockChange,
  isSelf,
}: BlockButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest } = useUser();
  const [isBlocked, setIsBlocked] = React.useState(initialIsBlocked);
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    setIsBlocked(initialIsBlocked);
  }, [initialIsBlocked]);

  const blockMutation = useToggleBlockMutation(targetUserId);

  if (isSelf || (user && user.id === targetUserId)) {
    return null;
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGuest || !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isBlocked) {
      // Direct unblock
      executeToggle(true);
    } else {
      // Confirm before blocking
      setShowConfirm(true);
    }
  };

  const executeToggle = (currentlyBlocked: boolean) => {
    const nextState = !currentlyBlocked;
    setIsBlocked(nextState);
    onBlockChange?.(nextState);

    blockMutation.mutate(currentlyBlocked, {
      onSuccess: (res) => {
        if (res.success && res.isBlocked !== undefined) {
          setIsBlocked(res.isBlocked);
          onBlockChange?.(res.isBlocked);
        } else {
          setIsBlocked(currentlyBlocked);
          onBlockChange?.(currentlyBlocked);
        }
      },
      onError: () => {
        setIsBlocked(currentlyBlocked);
        onBlockChange?.(currentlyBlocked);
      },
    });
  };

  const handleConfirmBlock = () => {
    setShowConfirm(false);
    executeToggle(false);
  };

  const isPending = blockMutation.isPending;

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={isBlocked ? "outline" : variant}
        onClick={handleActionClick}
        aria-label={
          isBlocked
            ? `Unblock @${targetUsername}`
            : `Block @${targetUsername}`
        }
        className={cn(
          "rounded-full transition-all font-sans text-xs h-7 px-2.5 gap-1.5 cursor-pointer",
          isBlocked
            ? "border-border text-foreground hover:bg-secondary"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
          className
        )}
      >
        <Ban className="w-3 h-3" />
        <span>{isBlocked ? "Unblock" : "Block"}</span>
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <ShieldAlert className="w-5 h-5" />
              <DialogTitle>Block @{targetUsername}?</DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground pt-1">
              Their stories will disappear from your feeds and search results immediately. They will not be able to follow you or interact with your stories (likes, comments). Any mutual following between you will be removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              className="rounded-full px-4 h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmBlock}
              disabled={isPending}
              className="rounded-full px-4 h-9 text-xs"
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
              Block author
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
