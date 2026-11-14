"use client";

import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">
          {error.message ||
            "An unexpected error occurred while loading this page."}
        </p>
        <Button onClick={() => reset()} variant="outline" className="mt-2">
          Try again
        </Button>
      </div>
    </div>
  );
}
