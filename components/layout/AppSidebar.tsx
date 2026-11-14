"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Search,
  Bookmark,
  LayoutDashboard,
  User,
  PanelRight,
  LogOut,
  LogIn,
  X,
  Loader2,
  FaceSlightlySmiling,
} from "lucide-react";
import { useUser } from "@/components/providers/user-provider";
import { useLogoutMutation } from "@/hooks/mutations/useAccountMutations";

interface AppSidebarProps {
  isMobile: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  isMobile,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { isGuest } = useUser();
  const logoutMutation = useLogoutMutation();
  const isLoggingOut = logoutMutation.isPending;

  const authenticatedNavItems = [
    {
      title: "For You",
      href: "/for-you-page",
      icon: FaceSlightlySmiling,
      isActive: pathname === "/for-you-page",
    },
    {
      title: "Explore",
      href: "/explore",
      icon: Compass,
      isActive: pathname.startsWith("/explore"),
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
      isActive: pathname.startsWith("/search"),
    },
    {
      title: "Bookmarks",
      href: "/bookmarks",
      icon: Bookmark,
      isActive: pathname.startsWith("/bookmarks"),
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      isActive: pathname.startsWith("/profile"),
    },
  ];

  const guestNavItems = [
    {
      title: "Explore",
      href: "/explore",
      icon: Compass,
      isActive: pathname.startsWith("/explore"),
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
      isActive: pathname.startsWith("/search"),
    },
  ];

  const navItems = isGuest ? guestNavItems : authenticatedNavItems;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const showExpanded = !isCollapsed || isMobile;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-5">
        {/* Brand / Logo + Toggle Section */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-sidebar-border">
          <Link
            href="/for-you-page"
            onClick={isMobile ? onCloseMobile : undefined}
            aria-hidden={!showExpanded}
            tabIndex={showExpanded ? 0 : -1}
            className={`flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group ${
              showExpanded
                ? "w-40 opacity-100 pl-2"
                : "w-0 opacity-0 pointer-events-none"
            }`}
          >
            <span className="font-display text-xl font-bold tracking-tight whitespace-nowrap text-sidebar-foreground group-hover:opacity-80 transition-opacity">
              Blogology
            </span>
          </Link>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
              title={showExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <PanelRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items (No write story button in sidebar; moved to navbar next to profile) */}
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!showExpanded ? item.title : undefined}
                onClick={isMobile ? onCloseMobile : undefined}
                className={`flex items-center h-10 rounded-xl text-xs font-medium transition-colors overflow-hidden ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <span className="w-10 h-10 shrink-0 flex items-center justify-center">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      active
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70"
                    }`}
                  />
                </span>
                <span
                  className={`whitespace-nowrap pr-3 transition-opacity duration-200 ${
                    showExpanded
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Sign in for guests or Logout for users */}
      <div className="border-t border-sidebar-border p-3">
        {isGuest ? (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            title={!showExpanded ? "Sign in" : undefined}
            className="flex items-center h-10 w-full rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors overflow-hidden cursor-pointer"
          >
            <span className="w-10 h-10 shrink-0 flex items-center justify-center">
              <LogIn className="w-[18px] h-[18px] shrink-0" />
            </span>
            <span
              className={`whitespace-nowrap pr-3 transition-opacity duration-200 ${
                showExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              Sign in
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={!showExpanded ? "Log out" : undefined}
            className="flex items-center h-10 w-full rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive-subtle/50 transition-colors overflow-hidden cursor-pointer disabled:opacity-50"
          >
            <span className="w-10 h-10 shrink-0 flex items-center justify-center">
              {isLoggingOut ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin shrink-0" />
              ) : (
                <LogOut className="w-[18px] h-[18px] shrink-0" />
              )}
            </span>
            <span
              className={`whitespace-nowrap pr-3 transition-opacity duration-200 ${
                showExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {isLoggingOut ? "Signing out…" : "Log out"}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  // Desktop / Tablet Sidebar (Full 256px or icon-only 64px)
  if (!isMobile) {
    return (
      <aside
        className={`h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden shrink-0 z-30 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    );
  }

  // Mobile Off-canvas Drawer
  return (
    <>
      {isOpenMobile && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border shadow-2xl transform transition-transform duration-200 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
