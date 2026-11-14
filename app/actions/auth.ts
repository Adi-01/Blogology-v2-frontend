"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { apiServerAction } from "@/lib/api/server-action";
import { COOKIE_NAMES } from "@/lib/constants";
import type { ActionState, AuthResponse } from "@/types/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _prevState: ActionState<AuthResponse> | null,
  formData: FormData
): Promise<ActionState<AuthResponse>> {
  const email = (formData.get("email") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";

  const errors: Record<string, string[]> = {};
  if (!email) {
    errors.email = ["Email is required."];
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  if (!password) {
    errors.password = ["Password is required."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the validation errors below.",
      errors,
      fields: { email },
    };
  }

  const res = await apiServerAction.mutate<AuthResponse, { email: string; password: string }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      body: { email, password },
    }
  );

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to sign in. Please verify your credentials.",
      fields: { email },
    };
  }

  const user = res.data;
  const callbackUrl = (formData.get("callbackUrl") as string)?.trim() || "";
  const safeDestination =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/for-you-page";

  if (!user.hasOnboarded) {
    redirect(
      `/onboarding${
        callbackUrl ? `?callbackUrl=${encodeURIComponent(safeDestination)}` : ""
      }`
    );
  } else {
    redirect(safeDestination);
  }
}

export async function signupAction(
  _prevState: ActionState<AuthResponse> | null,
  formData: FormData
): Promise<ActionState<AuthResponse>> {
  const name = (formData.get("name") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";
  const username = (formData.get("username") as string)?.trim() || undefined;

  const errors: Record<string, string[]> = {};

  if (!name) {
    errors.name = ["Name is required."];
  } else if (name.length < 2) {
    errors.name = ["Name must be at least 2 characters."];
  }

  if (!email) {
    errors.email = ["Email is required."];
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = ["Please enter a valid email address."];
  }

  if (!password) {
    errors.password = ["Password is required."];
  } else if (password.length < 8) {
    errors.password = ["Password must be at least 8 characters long."];
  }

  if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    errors.username = [
      "Username must be 3-30 characters and only contain letters, numbers, and underscores.",
    ];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the validation errors below.",
      errors,
      fields: { name, email, ...(username ? { username } : {}) },
    };
  }

  const res = await apiServerAction.mutate<
    AuthResponse,
    { name: string; email: string; password: string; username?: string }
  >("/api/v1/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
      ...(username ? { username } : {}),
    },
  });

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Registration failed. Please try again.",
      fields: { name, email, ...(username ? { username } : {}) },
    };
  }

  const callbackUrl = (formData.get("callbackUrl") as string)?.trim() || "";
  const safeDestination =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/for-you-page";

  redirect(
    `/onboarding${
      callbackUrl ? `?callbackUrl=${encodeURIComponent(safeDestination)}` : ""
    }`
  );
}

export async function forgotPasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim() || "";

  if (!email) {
    return {
      success: false,
      errors: { email: ["Email is required."] },
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      errors: { email: ["Please enter a valid email address."] },
    };
  }

  const res = await apiServerAction.mutate<null, { email: string }>(
    "/api/v1/auth/forgot-password",
    {
      method: "POST",
      body: { email },
    }
  );

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Something went wrong. Please try again later.",
    };
  }

  return {
    success: true,
    message: "If an account with that email exists, a password reset link has been sent. Please check your inbox (or dev terminal preview).",
  };
}

export async function resetPasswordAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const token = (formData.get("token") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  const errors: Record<string, string[]> = {};

  if (!token) {
    return {
      success: false,
      message: "Reset token is missing or invalid. Please request a new password reset link.",
    };
  }

  if (!password) {
    errors.password = ["Password is required."];
  } else if (password.length < 8) {
    errors.password = ["Password must be at least 8 characters long."];
  }

  if (!confirmPassword) {
    errors.confirmPassword = ["Please confirm your password."];
  } else if (password !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the validation errors below.",
      errors,
    };
  }

  const res = await apiServerAction.mutate<null, { token: string; password: string }>(
    "/api/v1/auth/reset-password",
    {
      method: "POST",
      body: { token, password },
    }
  );

  if (!res.ok) {
    return {
      success: false,
      message: res.error.message || "Failed to reset password. The link may have expired.",
    };
  }

  redirect("/login?reset=success");
}

export async function logoutAction(): Promise<void> {
  await apiServerAction.mutate("/api/v1/auth/logout", {
    method: "POST",
  });
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAMES.SESSION_TOKEN);
  redirect("/");
}


