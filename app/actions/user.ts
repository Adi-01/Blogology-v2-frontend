"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { userService } from "@/lib/services/user.services";
import { CACHE_TAGS, COOKIE_NAMES } from "@/lib/constants";
import type { ActionState } from "@/types/auth";

export async function changePasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const currentPassword = (formData.get("currentPassword") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const errors: Record<string, string[]> = {};

  if (!currentPassword) {
    errors.currentPassword = ["Current password is required."];
  }

  if (!newPassword) {
    errors.newPassword = ["New password is required."];
  } else if (newPassword.length < 8) {
    errors.newPassword = ["New password must be at least 8 characters long."];
  }

  if (!confirmPassword) {
    errors.confirmPassword = ["Please confirm your new password."];
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the validation errors below.",
      errors,
    };
  }

  const res = await userService.changePassword({
    currentPassword,
    newPassword,
  });

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to change password.",
    };
  }

  // Invalidate sessions tag because other sessions were revoked
  updateTag(CACHE_TAGS.auth.sessions());

  return {
    success: true,
    message: "Password updated successfully. Other active sessions have been signed out.",
  };
}

export async function revokeSessionAction(
  sessionId: string,
  isCurrentSession: boolean
): Promise<{ success: boolean; message: string }> {
  const res = await userService.revokeSession(sessionId);

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to revoke session.",
    };
  }

  // Invalidate sessions cache immediately
  updateTag(CACHE_TAGS.auth.sessions());

  if (isCurrentSession) {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.SESSION_TOKEN);
    redirect("/login");
  }

  return {
    success: true,
    message: "Session revoked successfully.",
  };
}

export async function deleteAccountAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const confirmation = (formData.get("confirmation") as string)?.trim() || "";

  if (confirmation !== "DELETE") {
    return {
      success: false,
      message: "Please type DELETE to confirm account deletion.",
    };
  }

  const res = await userService.deleteAccount();

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to delete account.",
    };
  }

  // Clear cookie and invalidate all user tags
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.SESSION_TOKEN);
  updateTag(CACHE_TAGS.auth.me());
  updateTag(CACHE_TAGS.auth.sessions());

  redirect("/");
}

export async function toggleFollowAction(
  targetUserId: string,
  currentlyFollowing?: boolean
): Promise<{
  success: boolean;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
  error?: string;
}> {
  const follow = currentlyFollowing !== undefined ? !currentlyFollowing : undefined;
  const res = await userService.toggleFollow(targetUserId, follow);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to update follow status.",
    };
  }

  // Follow changes feed scoring weights
  updateTag(CACHE_TAGS.posts.all());

  return {
    success: true,
    isFollowing: res.data.isFollowing,
    followersCount: res.data.followersCount,
    followingCount: res.data.followingCount,
  };
}

export async function toggleBlockAction(
  targetUserId: string,
  currentlyBlocked?: boolean
): Promise<{
  success: boolean;
  isBlocked?: boolean;
  error?: string;
}> {
  const block = currentlyBlocked !== undefined ? !currentlyBlocked : undefined;
  const res = await userService.toggleBlock(targetUserId, block);

  if (!res.ok) {
    return {
      success: false,
      error: res.error.message || "Failed to update block status.",
    };
  }

  // Block permanently alters visible feeds and posts
  updateTag(CACHE_TAGS.posts.all());

  return {
    success: true,
    isBlocked: res.data.isBlocked,
  };
}

export async function updateProfileAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim() || "";
  const bio = (formData.get("bio") as string)?.trim() || "";
  const avatar = (formData.get("avatar") as string)?.trim() || null;

  if (!name) {
    return {
      success: false,
      message: "Full name cannot be empty.",
      errors: { name: ["Full name is required."] },
    };
  }

  const res = await userService.updateProfile({
    name,
    bio: bio || null,
    avatar: avatar || null,
  });

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to update profile.",
    };
  }

  updateTag(CACHE_TAGS.auth.me());
  if (res.data.username) {
    updateTag(CACHE_TAGS.user.profile(res.data.username));
  }

  return {
    success: true,
    message: "Profile updated successfully.",
  };
}

export async function saveInterestsAction(tagIds: string[]): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!tagIds || tagIds.length < 3) {
    return {
      success: false,
      message: "Please select at least 3 topics to continue.",
    };
  }

  const res = await userService.saveInterests(tagIds);

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to save interest topics.",
    };
  }

  updateTag(CACHE_TAGS.auth.me());
  updateTag(CACHE_TAGS.posts.all());

  return {
    success: true,
  };
}

