import { cn } from "@/utils/cn";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-[var(--radius-lg)] bg-white/55",
        className,
      )}
    />
  );
}

export function FeedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-4xl">
        <SkeletonBlock className="h-4 w-48" />
        <SkeletonBlock className="mt-4 h-12 w-full max-w-2xl rounded-2xl" />
        <SkeletonBlock className="mt-4 h-6 w-full max-w-xl rounded-2xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)]">
        <SkeletonBlock className="min-h-[340px] rounded-[var(--radius-xl)] sm:min-h-[380px] lg:min-h-[44vh]" />
        <div className="hidden grid-rows-[1fr_1.15fr] gap-4 lg:grid">
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBlock className="aspect-[4/3]" />
            <SkeletonBlock className="aspect-[4/3]" />
          </div>
          <SkeletonBlock className="aspect-[16/9]" />
        </div>
      </div>

      <div className="mt-8">
        <SkeletonBlock className="h-9 w-64 rounded-2xl" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-lg rounded-2xl" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className={index < 2 ? "aspect-[16/10] xl:col-span-2" : "aspect-[16/9]"}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <SkeletonBlock className="h-9 w-56 rounded-2xl" />
        <div className="mt-4 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-40 min-w-[300px]" />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <div>
          <SkeletonBlock className="h-9 w-56 rounded-2xl" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className={index % 5 === 0 ? "h-80" : "h-64"}
              />
            ))}
          </div>
        </div>
        <div className="hidden rounded-[var(--radius-lg)] border border-border bg-card p-5 [box-shadow:var(--shadow-soft)] lg:block">
          <SkeletonBlock className="h-6 w-40" />
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonBlock key={index} className="mt-5 h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}
