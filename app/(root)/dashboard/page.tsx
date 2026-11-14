import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardClient } from "@/app/(root)/dashboard/components/DashboardClient";
import { PAGE_CONTAINER_CLASS } from "@/lib/constants";
export const instant = false

export const metadata: Metadata = {
  title: "My Stories — Blogology Dashboard",
  description: "Manage your drafts, published stories, and performance metrics.",
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className={PAGE_CONTAINER_CLASS}>
          <div className="h-16 w-64 rounded-md bg-muted/50 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
            <div className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
            <div className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
          </div>
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
