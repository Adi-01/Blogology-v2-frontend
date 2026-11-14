import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Blogology",
  description: "Sign in to your Blogology account.",
};

export default function LoginPage() {
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
            Welcome back.
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue reading and writing.
          </p>
        </div>

        <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-xl bg-muted/40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
