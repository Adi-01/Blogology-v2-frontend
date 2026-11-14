"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PostBackButtonProps {
  fallbackHref: string;
  label?: string;
}

export function PostBackButton({
  fallbackHref,
  label = "Go back",
}: PostBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground text-xs sm:text-sm font-medium transition-colors cursor-pointer border border-border/60 hover:border-border"
      title={label}
      aria-label={label}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
