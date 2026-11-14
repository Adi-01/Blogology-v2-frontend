import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create an account — Blogology",
  description: "Join Blogology to read and publish thoughtful stories.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3 text-center">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-foreground hover:opacity-80"
          >
            Blogology
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Create an account.
          </h1>
          <p className="text-sm text-muted-foreground">
            Start writing and discover voices that matter.
          </p>
        </div>

        <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-xl bg-muted/40" />}>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  );
}

