import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COOKIE_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LandingActionsProps {
  className?: string;
}

export async function LandingActions({ className }: LandingActionsProps) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value);

  if (hasSession) {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row items-center justify-center gap-3.5",
          className
        )}
      >
        <Link href="/for-you-page" className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full group cursor-pointer"
          >
            <span>Go to your feed</span>
            <ArrowRight
              className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </Button>
        </Link>
        <Link href="/explore" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full cursor-pointer hover:bg-secondary/70 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" strokeWidth={1.5} />
            <span>Explore archive</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-center gap-3.5",
        className
      )}
    >
      <Link href="/signup" className="w-full sm:w-auto">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full group cursor-pointer"
        >
          <span>Start reading</span>
          <ArrowRight
            className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={1.5}
          />
        </Button>
      </Link>
      <Link href="/explore" className="w-full sm:w-auto">
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto h-12 px-8 text-sm font-medium rounded-full cursor-pointer hover:bg-secondary/70 transition-colors"
        >
          <span>Explore stories</span>
        </Button>
      </Link>
    </div>
  );
}
