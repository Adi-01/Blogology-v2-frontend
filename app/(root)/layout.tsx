import * as React from "react";
import { cookies } from "next/headers";
import { UserProvider } from "@/components/providers/user-provider";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { userService } from "@/lib/services/user.services";
import { COOKIE_NAMES } from "@/lib/constants";

export default async function RootWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value);
  const user = hasSession ? await userService.getCurrentUser() : null;

  return (
    <UserProvider initialUser={user ?? undefined} hasSession={hasSession}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </UserProvider>
  );
}
