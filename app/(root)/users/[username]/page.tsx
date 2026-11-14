import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { userService } from "@/lib/services/user.services";
import { ProfileViewClient } from "./components/ProfileViewClient";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export const instant = false;

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await userService.getUserProfileByUsername(username);

  if (!profile) {
    return {
      title: "Author Not Found — Blogology",
    };
  }

  return {
    title: `${profile.name} (@${profile.username}) — Blogology`,
    description:
      profile.bio || `Read stories published by ${profile.name} on Blogology.`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const [profile, currentUser, postsResult] = await Promise.all([
    userService.getUserProfileByUsername(username),
    userService.getCurrentUser(),
    userService.getUserPostsByUsername(username, { limit: 10 }),
  ]);

  if (!profile) {
    notFound();
  }

  const initialPosts = postsResult ?? {
    items: [],
    nextCursor: null,
    hasMore: false,
  };

  return (
    <ProfileViewClient
      initialProfile={profile}
      initialPosts={initialPosts}
      currentUserId={currentUser?.id}
    />
  );
}
