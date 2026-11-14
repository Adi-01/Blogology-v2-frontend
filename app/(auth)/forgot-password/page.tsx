import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Blogology",
  description: "Reset your Blogology account password.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3 text-center">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          >
            Blogology
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Reset password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we’ll send you a link to reset your password.
          </p>
        </div>

        <Suspense fallback={<div className="h-40 w-full animate-pulse rounded-xl bg-muted/40" />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

