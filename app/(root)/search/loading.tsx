import { PAGE_CONTAINER_CLASS } from "@/lib/constants";

export default function SearchLoading() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="border-b border-border pb-6 space-y-2.5">
        <div className="h-9 w-32 rounded-md bg-muted/50 animate-pulse" />
        <div className="h-4 w-80 rounded-md bg-muted/40 animate-pulse" />
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 rounded-full bg-muted/50 animate-pulse" />
        <div className="h-11 w-36 rounded-full bg-muted/40 animate-pulse" />
      </div>

      <div className="space-y-4 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
