"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { PersonalTabContent } from "./PersonalTabContent";
import { AccountTabContent } from "./AccountTabContent";
import { BillingTabContent } from "./BillingTabContent";
import { useUser } from "@/components/providers/user-provider";
import { updateProfileAction } from "@/app/actions/user";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";

export function ProfileClient() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<"personal" | "account" | "billing">(() => {
    return searchParams.get("billing_status") ? "billing" : "personal";
  });

  // Saved baseline state (for text fields only)
  const [savedName, setSavedName] = React.useState(user?.name || "");
  const [savedBio, setSavedBio] = React.useState(user?.bio || "");

  // Form State (text inputs)
  const [name, setName] = React.useState(user?.name || "");
  const [bio, setBio] = React.useState(user?.bio || "");

  // Avatar State (managed independently)
  const [avatar, setAvatar] = React.useState<string | null>(user?.avatar || null);
  const [isAvatarUpdating, setIsAvatarUpdating] = React.useState(false);

  // Feedback State
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Keep state synced when user data is loaded / hydrated
  React.useEffect(() => {
    if (user) {
      setSavedName(user.name || "");
      setSavedBio(user.bio || "");
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || null);
    }
  }, [user?.id, user?.name, user?.bio, user?.avatar]);

  if (!user) {
    return null;
  }

  // isChanged is strictly for text data (name, bio)
  const isChanged =
    name.trim() !== savedName.trim() ||
    bio.trim() !== savedBio.trim();

  // Avatar add / remove happens independently and immediately
  const handleAvatarChange = async (newUrl: string | null) => {
    setIsAvatarUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", savedName);
      formData.append("bio", savedBio);
      if (newUrl) {
        formData.append("avatar", newUrl);
      }

      const res = await updateProfileAction(null, formData);
      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.message || "Failed to update profile photo.",
        });
      } else {
        setAvatar(newUrl);
        setStatusMessage({
          type: "success",
          text: newUrl ? "Profile photo updated." : "Profile photo removed.",
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update profile photo.",
      });
    } finally {
      setIsAvatarUpdating(false);
    }
  };

  // Cancel only resets text data
  const handleResetText = () => {
    setName(savedName);
    setBio(savedBio);
    setStatusMessage(null);
  };

  // Save only updates text data
  const handleSaveText = async () => {
    if (!name.trim()) {
      setStatusMessage({
        type: "error",
        text: "Name cannot be empty.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("bio", bio.trim());
      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await updateProfileAction(null, formData);
      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.message || "Failed to update profile.",
        });
      } else {
        setSavedName(name.trim());
        setSavedBio(bio.trim());
        setStatusMessage({
          type: "success",
          text: "Changes saved.",
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      {/* Page Header */}
      <header className="space-y-1.5 border-b border-border/60 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and account preferences.
        </p>

        {/* Clean Two-Tab Switcher */}
        <div className="pt-4 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none",
              activeTab === "personal"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none",
              activeTab === "account"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            Account & Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("billing")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none",
              activeTab === "billing"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            Plan & Billing
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all",
            statusMessage.type === "success"
              ? "bg-secondary text-foreground border border-border"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-foreground" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === "personal" && (
        <PersonalTabContent
          name={name}
          setName={setName}
          bio={bio}
          setBio={setBio}
          avatar={avatar}
          onAvatarChange={handleAvatarChange}
          isAvatarUpdating={isAvatarUpdating}
          username={user.username}
          email={user.email}
          isChanged={isChanged}
          isSaving={isSaving}
          onSave={handleSaveText}
          onReset={handleResetText}
        />
      )}

      {/* TAB 2: ACCOUNT & SECURITY */}
      {activeTab === "account" && <AccountTabContent user={user} />}

      {/* TAB 3: PLAN & BILLING */}
      {activeTab === "billing" && <BillingTabContent user={user} />}
    </div>
  );
}
