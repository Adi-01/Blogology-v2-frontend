"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelRight, SquarePen } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface WorkspaceShellProps {
  children: React.ReactNode;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const isMobile = useMobile();
  const pathname = usePathname();
  const { user, isGuest } = useUser();

  const isWritePage = pathname.startsWith("/write");
  const isDashboard = pathname.startsWith("/dashboard");

  // Mobile drawer open state
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  // Desktop / Tablet sidebar collapsed state (toggleable icon-only mode)
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  // Close mobile drawer on route changes
  React.useEffect(() => {
    setIsOpenMobile(false);
  }, [pathname]);

  // On write page: hide sidebar and topbar completely so editor gets 100% canvas
  if (isWritePage) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <main className="w-full min-h-screen">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* App Sidebar: Full or icon-only on laptop/tablet; off-canvas drawer on mobile */}
      <AppSidebar
        isMobile={isMobile}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Right Side Inset: Top Navbar + Main Content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar: Houses Write Story button and Profile avatar (clean on desktop, no blogology text) */}
        <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Mobile Left: PanelRight Toggle + Brand (Hidden on desktop/tablet) */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsOpenMobile(true)}
              className="p-2 -ml-2 rounded-full hover:bg-secondary text-foreground transition-colors cursor-pointer"
              title="Open menu"
            >
              <PanelRight className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Left: Clean spacer (No Blogology text and no toggle in navbar; toggle is in the sidebar header) */}
          <div className="hidden md:block" />

          {/* Right: Actions */}
          {isGuest ? (
            <div className="flex items-center gap-2">
              <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs font-medium h-8 px-3"
                >
                  Sign in
                </Button>
              </Link>
              <Link href={`/signup?callbackUrl=${encodeURIComponent(pathname)}`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full text-xs font-medium h-8 px-3.5 shadow-xs"
                >
                  Get started
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {!isDashboard && (
                <Link href="/write">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full gap-2 text-xs font-medium h-9 px-4 shadow-xs"
                  >
                    <SquarePen className="w-4 h-4" />
                    <span>Write story</span>
                  </Button>
                </Link>
              )}

              {user && (
                <Link
                  href="/profile"
                  className="p-0.5 rounded-full hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title={`${user.name || user.username || "User"} (${user.email})`}
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name || "Profile"}
                      className="w-9 h-9 rounded-full object-cover aspect-square shrink-0 border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-semibold text-xs text-foreground uppercase border border-border aspect-square shrink-0">
                      {(user.name || user.email || "U").charAt(0)}
                    </div>
                  )}
                </Link>
              )}

              <ThemeToggle />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
