"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePlansQuery } from "@/hooks/queries/usePlans";
import { createCheckoutSessionAction } from "@/app/actions/billing";
import { Check, Loader2, Sparkles, AlertCircle, CheckCircle2, X } from "lucide-react";
import type { AuthUser } from "@/types/auth";

interface BillingTabContentProps {
  user: AuthUser;
}

export function BillingTabContent({ user }: BillingTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billingStatus = searchParams.get("billing_status");
  const [dismissedStatus, setDismissedStatus] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearBillingStatus = () => {
    setDismissedStatus(true);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("billing_status");
    router.replace(nextUrl.pathname + (nextUrl.search ? nextUrl.search : ""), { scroll: false });
  };

  const { data: plans = [], isPending: isLoadingPlans } = usePlansQuery();

  const proPlan = plans.find((p) => p.name === "PRO");

  // Determine if current user is on PRO
  const isPro = Boolean(proPlan && user.planId === proPlan.id);

  // If URL says success but user is actually not PRO (e.g. manually typed in URL), remove parameter
  useEffect(() => {
    if (billingStatus === "success" && !isLoadingPlans && !isPro) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("billing_status");
      router.replace(nextUrl.pathname + (nextUrl.search ? nextUrl.search : ""), { scroll: false });
    }
  }, [billingStatus, isLoadingPlans, isPro, router]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setErrorMessage(null);

    try {
      const result = await createCheckoutSessionAction("PRO");
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setErrorMessage(result.error || "Failed to start checkout. Please try again.");
        setIsUpgrading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Status banners from Stripe redirects */}
      {billingStatus === "success" && isPro && !dismissedStatus && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-foreground shrink-0" />
            <div>
              <p className="font-medium">Plan upgraded successfully!</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Your account now has access to 100 daily AI streaming requests.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearBillingStatus}
            aria-label="Dismiss banner"
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {billingStatus === "cancelled" && !dismissedStatus && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">Checkout was cancelled</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                No charges were made. You can upgrade anytime below.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearBillingStatus}
            aria-label="Dismiss banner"
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Overview Card */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
              Current subscription
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground font-sans">
                {isPro ? "Pro Plan" : "Free Plan"}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border bg-secondary text-secondary-foreground">
                {isPro ? "Active Pro" : "Free Tier"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isPro
                ? "You have 100 AI streaming assistance & summarisation requests per day."
                : "You have 10 AI streaming assistance & summarisation requests per day."}
            </p>
          </div>

          {!isPro && (
            <Button
              type="button"
              onClick={handleUpgrade}
              disabled={isUpgrading || isLoadingPlans}
              className="rounded-full px-6 h-11 bg-primary text-primary-foreground hover:opacity-90 self-start sm:self-auto shrink-0"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to Pro ($15/mo)
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Plan Feature Comparison Grid */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground font-sans">
            Compare plans
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose the plan that suits your writing and reading habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Free Tier Card */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Free</span>
                {!isPro && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    Current
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
                  $0
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Essential blogging and casual reading.
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono">
                  What&apos;s included
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span>Full reading, bookmarking & discovery feeds</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span>Rich BlockNote blog editor & draft management</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span>10 daily AI streaming requests (compose & rephrase)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span>Post comments, likes & community follows</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled
              className="w-full rounded-full h-11 border-border text-muted-foreground"
            >
              {!isPro ? "Current plan" : "Default tier"}
            </Button>
          </div>

          {/* Pro Tier Card */}
          <div className="rounded-xl border-2 border-foreground bg-card p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-xs relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Pro</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-foreground text-background">
                    Recommended
                  </span>
                </div>
                {isPro && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    Current
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
                  $15
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  High-capacity AI generation for prolific essayists and writers.
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-mono">
                  Everything in Free, plus:
                </p>
                <ul className="space-y-2.5 text-sm text-foreground">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span className="font-medium">100 daily AI requests (10x limit increase)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span>Covers all AI tools: compose, rephrase & summarize</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                    <span>Ideal for daily publishing and extensive editing</span>
                  </li>
                </ul>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleUpgrade}
              disabled={isPro || isUpgrading || isLoadingPlans}
              className="w-full rounded-full h-11 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Stripe...
                </>
              ) : isPro ? (
                "Active subscription"
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Mode Note */}
      <p className="text-xs text-muted-foreground text-center font-mono">
        Test-mode: Checkout runs via Stripe test credentials. Use standard Stripe test cards (e.g. 4242 4242 4242 4242) — no real currency is charged.
      </p>
    </div>
  );
}
