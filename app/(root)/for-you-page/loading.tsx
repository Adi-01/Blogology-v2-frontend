import { PAGE_CONTAINER_CLASS } from "@/lib/constants";

export default function ForYouLoading() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <header className="border-b border-border pb-6 space-y-2.5">
        <div className="h-9 w-36 rounded-md bg-muted/50 animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-muted/40 animate-pulse" />
      </header>

      <section className="divide-y divide-border/70">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="flex flex-col sm:flex-row items-start justify-between gap-6 py-7"
          >
            <div className="flex-1 min-w-0 space-y-3 w-full">
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-full bg-muted/50 animate-pulse shrink-0" />
                <div className="h-3.5 w-28 rounded-full bg-muted/50 animate-pulse" />
                <div className="h-3.5 w-20 rounded-full bg-muted/40 animate-pulse" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="h-6 w-11/12 rounded-md bg-muted/50 animate-pulse" />
                <div className="h-6 w-3/4 rounded-md bg-muted/50 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="h-4 w-full rounded-md bg-muted/40 animate-pulse" />
                <div className="h-4 w-5/6 rounded-md bg-muted/40 animate-pulse" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-5 w-16 rounded-full bg-muted/40 animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-muted/40 animate-pulse" />
                <div className="h-3.5 w-10 rounded-full bg-muted/40 animate-pulse ml-auto" />
              </div>
            </div>

            <div className="w-full sm:w-44 aspect-[16/10] sm:aspect-square rounded-2xl bg-muted/50 animate-pulse shrink-0" />
          </article>
        ))}
      </section>
    </div>
  );
}
