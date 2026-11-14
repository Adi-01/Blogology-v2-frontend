import type { Metadata } from "next";
import { ProfileClient } from "./components/ProfileClient";
export const instant = false

export const metadata: Metadata = {
  title: "Profile & Settings - Blogology",
  description:
    "Manage your account, active sessions, and security credentials.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
