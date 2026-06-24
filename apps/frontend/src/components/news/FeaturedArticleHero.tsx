"use client";

import { memo } from "react";
import type { NewsArticle } from "@/types/news";
import { formatPublishedDate, getCategoryLabel } from "@/utils/news-format";
import { NewsImage } from "./NewsImage";

type FeaturedArticleHeroProps = {
  article: NewsArticle;
  onClick: (articleId: string) => void;
};

export const FeaturedArticleHero = memo(function FeaturedArticleHero({
  article,
  onClick,
}: FeaturedArticleHeroProps) {
  return (
    <button
      type="button"
      aria-label={`Open article: ${article.title}`}
      onClick={() => onClick(article.id)}
      className="group hover:-translate-y-[2px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
      style={{
        position: 'relative',
        height: '380px',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '22px',
        textAlign: 'left',
        color: 'white',
        backgroundColor: '#131921',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
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
        priority
        sizes="(min-width: 1024px) 64vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
      />

      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.12) 100%)',
          zIndex: 1
        }} 
      />
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle_at_18%_20%, rgba(255,221,148,0.2), transparent 40%)',
          zIndex: 2
        }} 
      />

      <div 
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'end',
          padding: '24px',
          zIndex: 3,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <span className="mb-3 inline-flex w-fit rounded-full border border-white/10 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] backdrop-blur">
          {getCategoryLabel(article.category)}
        </span>
        <h2 className="max-w-[calc(100vw-4rem)] break-words font-display text-xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:max-w-3xl sm:text-2xl lg:text-3xl" style={{ color: 'white' }}>
          {article.title}
        </h2>
        {article.aiSummary ? (
          <p className="mt-2.5 line-clamp-2 max-w-2xl text-sm leading-6 text-white/80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {article.aiSummary}
          </p>
        ) : null}
        <p className="mt-3 text-xs font-medium text-white/70" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {article.sourceName} · {formatPublishedDate(article.publishedAt)}
        </p>
      </div>
    </button>
  );
});
