"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUserQuery } from "@/hooks/queries/useUser";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/types/auth";

export interface UserContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const defaultGuestValue: UserContextValue = {
  user: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: false,
  refetch: () => {},
};

const UserContext = createContext<UserContextValue>(defaultGuestValue);

export interface UserProviderProps {
  initialUser?: AuthUser;
  hasSession?: boolean;
  children: React.ReactNode;
}

export function UserProvider({
  initialUser,
  hasSession = false,
  children,
}: UserProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isPending, isError, refetch } =
    useCurrentUserQuery(initialUser, hasSession);

  useEffect(() => {
    if (user && !user.hasOnboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [user, pathname, router]);

  const value = useMemo<UserContextValue>(() => {
    if (!hasSession) {
      return defaultGuestValue;
    }
    const resolvedUser = user ?? initialUser ?? null;
    return {
      user: resolvedUser,
      isAuthenticated: Boolean(resolvedUser),
      isGuest: !resolvedUser && !isPending,
      isLoading: isPending && !initialUser,
      refetch,
    };
  }, [hasSession, user, initialUser, isPending, refetch]);

  if (isError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 font-sans">
        <p className="text-sm text-muted-foreground">
          Unable to load your workspace session.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-full px-5"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (user && !user.hasOnboarded && pathname !== "/onboarding") {
    return null;
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  return context ?? defaultGuestValue;
}
