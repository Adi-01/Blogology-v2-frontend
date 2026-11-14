import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { userService } from "@/lib/services/user.services";
import { OnboardingClient } from "./components/OnboardingClient";

export const instant = false;

export const metadata: Metadata = {
  title: "Welcome to Blogology — Onboarding",
  description: "Personalize your reading experience and choose your topics.",
};

export default async function OnboardingPage() {
  const [user, tags] = await Promise.all([
    userService.getCurrentUser(),
    userService.getAllTags(),
  ]);

  if (!user) {
    redirect("/login");
  }

  // Already onboarded users should never see onboarding
  if (user.hasOnboarded) {
    redirect("/for-you-page");
  }

  return <OnboardingClient tags={tags} userName={user.name} />;
}
