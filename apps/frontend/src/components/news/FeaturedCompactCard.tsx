"use client";

import { memo } from "react";
import type { NewsArticle } from "@/types/news";
import { formatPublishedDate, getCategoryLabel } from "@/utils/news-format";
import { cn } from "@/utils/cn";
import { NewsImage } from "./NewsImage";

type FeaturedCompactCardProps = {
  article: NewsArticle;
  onClick: (articleId: string) => void;
  size?: "small" | "medium";
};

export const FeaturedCompactCard = memo(function FeaturedCompactCard({
  article,
  onClick,
  size = "small",
}: FeaturedCompactCardProps) {
  return (
    <button
      type="button"
      aria-label={`Open article: ${article.title}`}
      onClick={() => onClick(article.id)}
      className="group hover:-translate-y-[2px] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-foreground/20"
      style={{
        position: 'relative',
        width: '100%',
        height: size === 'medium' ? '240px' : '182px',
        overflow: 'hidden',
        borderRadius: '16px',
        textAlign: 'left',
        color: 'white',
        backgroundColor: '#131921',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'end',
      }}
    >
      <NewsImage
        src={article.imageUrl}
        category={article.category}
        articleId={article.id}
        alt={article.title}
        sizes="(min-width: 1024px) 18vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
      />

      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.08) 100%)',
          zIndex: 1
        }} 
      />

      <div 
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'end',
          padding: '16px',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <span className="mb-1.5 inline-flex w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur" style={{ color: 'white' }}>
          {getCategoryLabel(article.category)}
        </span>
        <h3
          className={cn(
            "break-words font-display font-semibold leading-snug tracking-tight",
            size === "medium" ? "text-lg" : "text-[15px] leading-[1.35]",
          )}
          style={{ color: 'white' }}
        >
          {article.title}
        </h3>
        <p className="mt-1.5 text-[10px] font-medium text-white/70" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {article.sourceName} · {formatPublishedDate(article.publishedAt)}
        </p>
      </div>
    </button>
  );
});
