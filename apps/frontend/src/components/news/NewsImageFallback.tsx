import type { NewsCategory } from "@/types/news";
import { getCategoryLabel } from "@/utils/news-format";
import { cn } from "@/utils/cn";

type NewsImageFallbackProps = {
  category: NewsCategory | null;
  className?: string;
  tone?: "light" | "dark";
};

export function NewsImageFallback({
  category,
  className,
  tone = "dark",
}: NewsImageFallbackProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: 'var(--aws-gradient)' }}
      aria-hidden="true"
    >
      <div className="gradient-overlay opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.46),transparent_30%)]" />
      <div
        className={cn(
          "relative mx-6 rounded-[var(--radius-lg)] border px-5 py-4 text-center backdrop-blur-md",
          tone === "dark"
            ? "border-white/35 bg-black/20 text-white"
            : "border-white/55 bg-white/45 text-foreground",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em]">
          {getCategoryLabel(category)}
        </p>
        <p className="mt-2 font-display text-lg font-semibold">
          AWS Community Newsroom
        </p>
      </div>
    </div>
  );
}
