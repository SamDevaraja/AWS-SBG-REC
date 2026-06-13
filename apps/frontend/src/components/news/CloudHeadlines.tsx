"use client";

import { memo } from "react";
import type { NewsArticle } from "@/types/news";
import {
  formatRelativeTime,
  getCategoryLabel,
  getCloudHeadlines,
} from "@/utils/news-format";
import { cn } from "@/utils/cn";

type CloudHeadlinesProps = {
  articles: NewsArticle[];
  onArticleClick: (articleId: string) => void;
  className?: string;
};

export const CloudHeadlines = memo(function CloudHeadlines({
  articles,
  onArticleClick,
  className,
}: CloudHeadlinesProps) {
  const headlines = getCloudHeadlines(articles, 10);

  return (
    <aside
      aria-label="Cloud headlines"
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-card/92 p-4 [box-shadow:var(--shadow-soft)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-3">
        <div className="mb-2 h-px w-12 bg-[color:var(--accent)]" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
          Fast scan
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold tracking-tight">
          Cloud Headlines
        </h2>
      </div>
      <div className="divide-y divide-border/80">
        {headlines.map((article) => (
          <button
            key={article.id}
            type="button"
            aria-label={`Open article: ${article.title}`}
            onClick={() => onArticleClick(article.id)}
            className="group block w-full py-3 text-left transition first:pt-0 focus:outline-none focus:ring-4 focus:ring-foreground/10"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {getCategoryLabel(article.category)} ·{" "}
              {formatRelativeTime(article.publishedAt)}
            </span>
            <span className="mt-1 block text-[13px] font-semibold leading-[1.45] text-foreground transition group-hover:text-[color:var(--accent)]">
              {article.title}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
});
