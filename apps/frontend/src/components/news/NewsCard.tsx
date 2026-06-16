"use client";
 
import { memo } from "react";
import type { NewsArticle } from "@/types/news";
import { cn } from "@/utils/cn";
import { formatPublishedDate, getCategoryLabel } from "@/utils/news-format";
import { NewsImage } from "./NewsImage";
 
type NewsCardProps = {
  article: NewsArticle;
  onClick: (articleId: string) => void;
  variant?:
    | "standard"
    | "large"
    | "horizontal"
    | "compact"
    | "overlay"
    | "headline"
    | "ticker"
    | "flat-editorial"
    | "flat-horizontal"
    | "quote";
  className?: string;
};
 
export const NewsCard = memo(function NewsCard({
  article,
  onClick,
  variant = "standard",
  className,
}: NewsCardProps) {
  // ─── OVERLAY CARD (Apple News / Artifact style text-over-image) ───
  if (variant === "overlay") {
    return (
      <button
        type="button"
        aria-label={`Open article: ${article.title}`}
        onClick={() => onClick(article.id)}
        className={cn(
          "group relative flex min-h-[200px] w-full overflow-hidden rounded-[var(--radius-lg)] text-left text-white [box-shadow:var(--shadow-soft)] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-hover)] focus:outline-none focus:ring-4 focus:ring-foreground/15",
          className,
        )}
      >
        <NewsImage
          src={article.imageUrl}
          category={article.category}
          articleId={article.id}
          alt={article.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
        <div className="relative flex w-full min-w-0 flex-col justify-end p-4">
          <span className="mb-1.5 inline-flex w-fit rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
            {getCategoryLabel(article.category)}
          </span>
          <h2 className="break-words font-display text-[15px] font-semibold leading-[1.3] tracking-tight [overflow-wrap:anywhere] group-hover:text-[color:var(--accent)] transition-colors duration-200">
            {article.title}
          </h2>
          <p className="mt-1.5 text-[10px] font-medium text-white/65">
            {article.sourceName} · {formatPublishedDate(article.publishedAt)}
          </p>
        </div>
      </button>
    );
  }
 
  // ─── HEADLINE ONLY CARD (Text-only editorial block) ───
  if (variant === "headline") {
    return (
      <button
        type="button"
        aria-label={`Open article: ${article.title}`}
        onClick={() => onClick(article.id)}
        className={cn(
          "group block w-full border-b border-border/50 py-3 text-left transition-colors duration-200 first:pt-0 hover:bg-white/40 focus:outline-none focus:ring-4 focus:ring-foreground/10",
          className,
        )}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-[10px] font-medium text-muted">
            {formatPublishedDate(article.publishedAt)}
          </span>
        </div>
        <h2 className="mt-1 break-words font-display text-[15px] font-semibold leading-[1.35] tracking-tight text-foreground transition-colors duration-200 group-hover:text-[color:var(--accent)] [overflow-wrap:anywhere]">
          {article.title}
        </h2>
        {article.aiSummary ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-muted">
            {article.aiSummary}
          </p>
        ) : null}
        <p className="mt-1.5 text-[10px] font-medium text-muted/70">
          {article.sourceName}
        </p>
      </button>
    );
  }
 
  // ─── COMPACT TICKER ROW (Fast horizontal text scan) ───
  if (variant === "ticker") {
    return (
      <button
        type="button"
        aria-label={`Open article: ${article.title}`}
        onClick={() => onClick(article.id)}
        className={cn(
          "group flex w-full items-center gap-3 border-b border-border/40 py-2.5 text-left transition-colors duration-200 hover:bg-white/40 focus:outline-none focus:ring-4 focus:ring-foreground/10",
          className,
        )}
      >
        <span className="shrink-0 rounded bg-foreground/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted">
          {getCategoryLabel(article.category)}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground transition-colors duration-200 group-hover:text-[color:var(--accent)]">
          {article.title}
        </span>
        <span className="shrink-0 text-[10px] text-muted/60">
          {formatPublishedDate(article.publishedAt)}
        </span>
      </button>
    );
  }
 
  // ─── FLAT EDITORIAL CARD (Image on top, no card borders/backgrounds) ───
  if (variant === "flat-editorial") {
    return (
      <button
        type="button"
        aria-label={`Open article: ${article.title}`}
        onClick={() => onClick(article.id)}
        className={cn(
          "group flex w-full flex-col text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-foreground/15",
          className,
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] mb-2.5">
          <NewsImage
            src={article.imageUrl}
            category={article.category}
            articleId={article.id}
            alt={article.title}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur">
            {getCategoryLabel(article.category)}
          </span>
        </div>
        <div className="px-0.5">
          <h2 className="break-words font-display text-[15px] font-semibold leading-[1.3] tracking-tight text-foreground transition-colors duration-200 group-hover:text-[color:var(--accent)]">
            {article.title}
          </h2>
          {article.aiSummary ? (
            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-muted">
              {article.aiSummary}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted/60">
            {article.sourceName} · {formatPublishedDate(article.publishedAt)}
          </p>
        </div>
      </button>
    );
  }
 
  // ─── FLAT HORIZONTAL CARD (Side-by-side, no card borders/backgrounds) ───
  if (variant === "flat-horizontal") {
    return (
      <button
        type="button"
        aria-label={`Open article: ${article.title}`}
        onClick={() => onClick(article.id)}
        className={cn(
          "group flex w-full gap-3.5 text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-foreground/15",
          className,
        )}
      >
        <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md sm:w-24">
          <NewsImage
            src={article.imageUrl}
            category={article.category}
            articleId={article.id}
            alt={article.title}
            sizes="96px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[color:var(--accent)]">
            {getCategoryLabel(article.category)}
          </span>
          <h2 className="mt-0.5 break-words font-display text-[13px] font-semibold leading-[1.3] tracking-tight text-foreground transition-colors duration-200 group-hover:text-[color:var(--accent)] line-clamp-2">
            {article.title}
          </h2>
          <p className="mt-1 text-[9px] font-medium text-muted/60">
            {article.sourceName} · {formatPublishedDate(article.publishedAt)}
          </p>
        </div>
      </button>
    );
  }
 
  // ─── EDITORIAL QUOTE CARD (Typography-focused statement box) ───
  if (variant === "quote") {
    return (
      <button
        type="button"
        aria-label={`Quote article: ${article.title}`}
        onClick={() => onClick(article.id)}
        className={cn(
          "group relative flex w-full flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--surface-alt)] p-4 text-left border border-border/40 [box-shadow:var(--shadow-soft)] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-hover)] focus:outline-none focus:ring-4 focus:ring-foreground/15",
          className,
        )}
      >
        <span className="font-serif text-5xl leading-none text-[color:var(--accent)] opacity-40 selection:bg-transparent -mb-2">
          “
        </span>
        <div className="relative z-10 flex-1">
          <p className="font-display text-[14px] font-medium leading-[1.4] tracking-tight text-foreground/90 italic group-hover:text-[color:var(--accent)] transition-colors duration-200">
            {article.title}
          </p>
          {article.aiSummary ? (
            <p className="mt-1.5 line-clamp-3 text-[11px] leading-[1.45] text-muted">
              {article.aiSummary}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/20 pt-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted">
          <span>{article.sourceName}</span>
          <span>{formatPublishedDate(article.publishedAt)}</span>
        </div>
      </button>
    );
  }
 
  // ─── CARD VARIANT RENDERING (standard, large, horizontal, compact) ───
  const isHorizontal = variant === "horizontal";
  const isLarge = variant === "large";
  const isCompact = variant === "compact";
 
  return (
    <button
      type="button"
      aria-label={`Open article: ${article.title}`}
      onClick={() => onClick(article.id)}
      className={cn(
        "group inline-flex w-full break-inside-avoid overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card text-left [box-shadow:var(--shadow-soft)] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:bg-white/92 hover:shadow-[var(--shadow-hover)] focus:outline-none focus:ring-4 focus:ring-foreground/15",
        isHorizontal ? "min-w-[260px] flex-row md:min-w-[320px]" : "flex-col",
        isLarge && "rounded-[var(--radius-xl)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          isHorizontal
            ? "aspect-[4/5] w-28 shrink-0 sm:w-36"
            : "aspect-[16/9] w-full",
          isLarge && "aspect-[16/8]",
          isCompact && "aspect-[16/8]",
        )}
      >
        <NewsImage
          src={article.imageUrl}
          category={article.category}
          articleId={article.id}
          alt={article.title}
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 48vw, 100vw"
          fallbackTone="light"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/35 bg-white/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground backdrop-blur">
          {getCategoryLabel(article.category)}
        </span>
      </div>
 
      <div
        className={cn(
          "flex min-w-0 flex-col",
          isHorizontal ? "p-3" : "px-3.5 py-3",
          isLarge && "px-4 py-3.5",
        )}
      >
        <h2
          className={cn(
            "break-words font-display font-semibold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-[color:var(--accent)]",
            isLarge ? "text-xl" : "text-[15px] leading-[1.35]",
            isCompact && "text-[15px] leading-[1.35]",
            isHorizontal && "text-[15px] leading-[1.35]",
          )}
        >
          {article.title}
        </h2>
        {article.aiSummary && !isCompact ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.55] text-muted">
            {article.aiSummary}
          </p>
        ) : null}
        <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          {article.sourceName} · {formatPublishedDate(article.publishedAt)}
        </p>
      </div>
    </button>
  );
});
