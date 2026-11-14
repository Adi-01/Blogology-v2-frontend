"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Key,
  ShieldCheck,
  Smartphone,
  Laptop,
  Monitor,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useSessionsQuery } from "@/hooks/queries/useSessions";
import { useBlockedUsers } from "@/hooks/queries/useUserSocial";
import {
  useChangePasswordMutation,
  useRevokeSessionMutation,
  useDeleteAccountMutation,
} from "@/hooks/mutations/useAccountMutations";
import { BlockedUsersList } from "@/components/profile/BlockedUsersList";
import type { AuthUser } from "@/types/auth";

interface AccountTabContentProps {
  user: AuthUser;
}

export function AccountTabContent({ user }: AccountTabContentProps) {
  const changePasswordMutation = useChangePasswordMutation();
  const revokeSessionMutation = useRevokeSessionMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  // Sessions Query & State
  const { data: sessions = [], isPending: isLoadingSessions } = useSessionsQuery(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);

  // Blocked Users Query & State
  const { data: blockedUsers = [] } = useBlockedUsers(user?.id);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  // Modals State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Password fields state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Delete state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await changePasswordMutation.mutateAsync(formData);
      if (!res.success) {
        setPasswordError(res.message || "Failed to change password.");
      } else {
        setPasswordSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess(null);
        }, 1500);
      }
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password."
      );
    }
  };

  const handleRevoke = async (sessionId: string, isCurrent: boolean) => {
    try {
      setRevokingId(sessionId);
      await revokeSessionMutation.mutateAsync({ sessionId, isCurrent });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    const otherSessions = sessions.filter((s) => !s.isCurrent);
    if (otherSessions.length === 0) return;

    try {
      setIsRevokingOthers(true);
      await Promise.all(
        otherSessions.map((s) =>
          revokeSessionMutation.mutateAsync({ sessionId: s.id, isCurrent: false })
        )
      );
    } finally {
      setIsRevokingOthers(false);
    }
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Confirmation must be exactly 'DELETE'.");
      return;
    }

    try {
      setIsDeleting(true);
      const formData = new FormData();
      formData.append("confirmation", "DELETE");
      const res = await deleteAccountMutation.mutateAsync(formData);
      if (res && !res.success) {
        setDeleteError(res.message || "Failed to delete account.");
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account."
      );
      setIsDeleting(false);
    }
  };

  const getDeviceIcon = (deviceLabel?: string | null) => {
    if (!deviceLabel) return Monitor;
    const lower = deviceLabel.toLowerCase();
    if (
      lower.includes("mobile") ||
      lower.includes("iphone") ||
      lower.includes("android")
    ) {
      return Smartphone;
    }
    if (lower.includes("mac") || lower.includes("laptop") || lower.includes("windows")) {
      return Laptop;
    }
    return Monitor;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Section: Password */}
      <section className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">
            Password
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage your login password.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              Account Password
            </p>
            <p className="text-[11px] text-muted-foreground">
              Update your password to keep your account protected.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPasswordModalOpen(true)}
            className="rounded-full h-8 px-3.5 text-xs font-medium cursor-pointer shrink-0"
          >
            Change password
          </Button>
        </div>
      </section>

      {/* Section: Active Sessions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-foreground">
              Active Sessions
            </h2>
            <p className="text-xs text-muted-foreground">
              Devices currently signed in to your account.
            </p>
          </div>

          {sessions.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRevokingOthers}
              onClick={handleRevokeOthers}
              className="rounded-full h-7 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              {isRevokingOthers ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : null}
              Sign out other devices
            </Button>
          )}
        </div>

        <div className="divide-y divide-border/60 rounded-xl border border-border bg-card/40">
          {isLoadingSessions ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading active sessions…</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No active sessions found.
            </div>
          ) : (
            sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceLabel);
              const isRevoking = revokingId === session.id;

              return (
                <div
                  key={session.id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border/50">
                      <DeviceIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-foreground truncate">
                          {session.deviceLabel || "Browser"}
                        </span>
                        {session.isCurrent && (
                          <span className="rounded-full bg-secondary px-2 py-0.2 text-[10px] font-medium text-muted-foreground">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {session.ipHint ? `IP ${session.ipHint} · ` : ""}
                        Signed in: {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isRevoking}
                      onClick={() => handleRevoke(session.id, session.isCurrent)}
                      className="rounded-full h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                    >
                      {isRevoking ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Section: Blocked Accounts */}
      <section className="space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">
            Blocked Accounts
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage accounts you have blocked from interacting with you.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/40 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              Blocked users ({blockedUsers.length})
            </p>
            <p className="text-[11px] text-muted-foreground">
              {blockedUsers.length > 0
                ? `${blockedUsers.length} accounts are currently blocked.`
                : "No blocked accounts."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsBlockedModalOpen(true)}
            className="rounded-full h-8 px-3.5 text-xs font-medium cursor-pointer shrink-0"
          >
            Manage
          </Button>
        </div>
      </section>

      {/* Section: Danger Zone */}
      <section className="space-y-3 pt-4 border-t border-border/60">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-destructive">
            Delete Account
          </h2>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              Delete Account
            </p>
            <p className="text-[11px] text-muted-foreground">
              Once deleted, your account cannot be recovered.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="rounded-full h-8 px-3.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-primary-foreground border-destructive/30 cursor-pointer shrink-0"
          >
            Delete account
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL: CHANGE PASSWORD */}
      {/* ========================================================================= */}
      <Dialog
        open={isPasswordModalOpen}
        onOpenChange={(open) => {
          setIsPasswordModalOpen(open);
          if (!open) {
            setPasswordError(null);
            setPasswordSuccess(null);
            setShowPassword(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] p-6 font-sans rounded-3xl">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-base font-semibold">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 py-2">
            {passwordError && (
              <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="current-pw" className="text-xs font-medium">
                Current Password
              </Label>
              <Input
                id="current-pw"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs font-medium">
                New Password
              </Label>
              <Input
                id="new-pw"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-xs font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-pw"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="show-passwords"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="size-4 rounded border-border accent-foreground cursor-pointer"
              />
              <label
                htmlFor="show-passwords"
                className="text-xs text-muted-foreground select-none cursor-pointer hover:text-foreground"
              >
                Show passwords
              </label>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={changePasswordMutation.isPending}
                className="rounded-full text-xs"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Updating…
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: BLOCKED ACCOUNTS LIST */}
      {/* ========================================================================= */}
      <Dialog open={isBlockedModalOpen} onOpenChange={setIsBlockedModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 font-sans rounded-3xl">
          <DialogHeader className="space-y-1 pb-3 border-b border-border">
            <DialogTitle className="text-base font-semibold">
              Blocked Accounts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review accounts you have blocked. Unblocking allows them to see your profile and stories again.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <BlockedUsersList />
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE ACCOUNT CONFIRMATION */}
      {/* ========================================================================= */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md p-6 font-sans rounded-3xl">
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-base font-semibold text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This action is permanent and cannot be undone. Type{" "}
              <strong className="text-foreground">DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteSubmit} className="space-y-4 pt-1">
            {deleteError && (
              <div className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
                {deleteError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="del-confirm" className="text-xs font-medium">
                Type DELETE to confirm
              </Label>
              <Input
                id="del-confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmation("");
                  setDeleteError(null);
                }}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isDeleting || deleteConfirmation !== "DELETE"}
                className="rounded-full text-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Deleting…
                  </>
                ) : (
                  "Delete permanently"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
