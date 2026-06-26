"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useState, useRef } from "react";
import { useFeed } from "@/hooks/useFeed";
import type { NewsArticle } from "@/types/news";
import { isCloudCategory } from "@/utils/news-format";
import { formatPublishedDate, getCategoryLabel } from "@/utils/news-format";
import { CloudHeadlines } from "./CloudHeadlines";
import { ErrorState } from "./ErrorState";
import { FeaturedArticleHero } from "./FeaturedArticleHero";
import { FeaturedCompactCard } from "./FeaturedCompactCard";
import { FeedSkeleton } from "./FeedSkeleton";
import { NewsCard } from "./NewsCard";
import { NewsImage } from "./NewsImage";
import { cn } from "@/utils/cn";

const ArticleDetailModal = dynamic(
  () =>
    import("./ArticleDetailModal").then((module) => module.ArticleDetailModal),
  {
    ssr: false,
  },
);

export function NewsFeedPage() {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const { data, isLoading, isError, refetch } = useFeed();
  const articles = data?.items ?? [];
  const newsroom = buildNewsroomSections(articles);

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <ErrorState
          onRetry={() => {
            void refetch();
          }}
        />
      </main>
    );
  }

  if (newsroom.featured === undefined) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <ErrorState
          title="No news available"
          message="The newsroom is ready, but there are no articles to display yet."
          actionLabel="Refresh news"
          onRetry={() => {
            void refetch();
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-4 py-4 sm:px-6 lg:px-8">
      <h1 className="sr-only">AWS Community Newsroom</h1>

      <div className="mx-auto max-w-[1440px]">
        <header className="mb-4 max-w-4xl">
          <p className="brand-note-text text-[10px] uppercase tracking-[0.08em]">
            AWS Community Newsroom
          </p>
          <p className="mt-2 max-w-[calc(100vw-2rem)] break-words font-display text-2xl font-semibold leading-tight tracking-tight text-foreground [overflow-wrap:anywhere] sm:max-w-full sm:text-3xl">
            Cloud intelligence, curated for builders.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            A dynamic editorial feed across cloud, AI, security, engineering,
            and emerging technology.
          </p>
        </header>

        {/* ─── FEATURED HERO + EDITOR HIGHLIGHTS ─── */}
        <section
          aria-label="Featured editorial stories"
          className={cn(
            newsroom.editorHighlights.length > 0
              ? "featured-editorial-grid"
              : "grid grid-cols-1"
          )}
        >
          <FeaturedArticleHero
            article={newsroom.featured}
            onClick={setSelectedArticleId}
          />

          {newsroom.editorHighlights.length > 0 ? (
            <div className="hidden gap-3 lg:flex lg:flex-col lg:h-[380px] w-full">
              {newsroom.editorHighlights.length === 1 && (
                <FeaturedCompactCard
                  article={newsroom.editorHighlights[0]}
                  onClick={setSelectedArticleId}
                  size="medium"
                  className="h-full"
                />
              )}
              {newsroom.editorHighlights.length === 2 && (
                <>
                  {newsroom.editorHighlights.map((article) => (
                    <FeaturedCompactCard
                      key={article.id}
                      article={article}
                      onClick={setSelectedArticleId}
                      className="flex-1"
                    />
                  ))}
                </>
              )}
              {newsroom.editorHighlights.length === 3 && (
                <div className="grid grid-rows-[1fr_1.15fr] gap-3 h-full w-full">
                  <div className="grid grid-cols-2 gap-3">
                    <FeaturedCompactCard
                      article={newsroom.editorHighlights[0]}
                      onClick={setSelectedArticleId}
                    />
                    <FeaturedCompactCard
                      article={newsroom.editorHighlights[1]}
                      onClick={setSelectedArticleId}
                    />
                  </div>
                  <FeaturedCompactCard
                    article={newsroom.editorHighlights[2]}
                    onClick={setSelectedArticleId}
                    size="medium"
                    className="h-full"
                  />
                </div>
              )}
            </div>
          ) : null}
        </section>

        {newsroom.editorHighlights.length > 0 ? (
          <div className={cn(
            "mt-3 grid gap-3 lg:hidden",
            newsroom.editorHighlights.length === 1 ? "grid-cols-1" : "md:grid-cols-2"
          )}>
            {newsroom.editorHighlights.map((article, index) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={setSelectedArticleId}
                className={cn(
                  newsroom.editorHighlights.length === 3 && index === 2 && "md:col-span-2"
                )}
              />
            ))}
          </div>
        ) : null}

        {/* ─── CLOUD SPOTLIGHT — Newsroom Collage ─── */}
        {newsroom.cloudSpotlight.length > 0 ? (
          <EditorialSection
            title="Cloud Spotlight"
            subtitle="Major updates from AWS, Azure, GCP, and cloud-native ecosystems."
            className="mt-5"
          >
            <CloudSpotlightCollage
              articles={newsroom.cloudSpotlight}
              onArticleClick={setSelectedArticleId}
            />
          </EditorialSection>
        ) : null}

        {/* ─── AI & EMERGING TECH — Featured + Editorial Rail ─── */}
        {newsroom.aiEmerging.length > 0 ? (
          <EditorialSection
            title="AI & Emerging Tech"
            subtitle="Signals from AI platforms, agents, machine learning, and developer tools."
            className="mt-5"
          >
            <AiEmergingLayout
              articles={newsroom.aiEmerging}
              onArticleClick={setSelectedArticleId}
            />
          </EditorialSection>
        ) : null}

        {/* ─── SECURITY WATCH — Briefing Bulletin ─── */}
        {newsroom.securityWatch.length > 0 ? (
          <SecurityBulletin
            articles={newsroom.securityWatch}
            onArticleClick={setSelectedArticleId}
            className="mt-5"
          />
        ) : null}

        {/* ─── TRENDING STORIES — Story Rail ─── */}
        {newsroom.trending.length > 0 ? (
          <TrendingStoryRail
            articles={newsroom.trending}
            onArticleClick={setSelectedArticleId}
            className="mt-5"
          />
        ) : null}

        {/* ─── LATEST UPDATES + CLOUD HEADLINES ─── */}
        <section
          aria-label="Latest updates"
          className={cn(
            "mt-5 grid gap-4",
            newsroom.latestUpdates.length > 0
              ? "lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]"
              : "grid-cols-1"
          )}
        >
          {newsroom.latestUpdates.length > 0 ? (
            <EditorialSection
              title="Latest Updates"
              subtitle="A mixed stream of the freshest stories across the newsroom."
            >
              <BalancedMasonry
                articles={newsroom.latestUpdates}
                onArticleClick={setSelectedArticleId}
              />
            </EditorialSection>
          ) : null}
          <CloudHeadlines
            articles={articles}
            onArticleClick={setSelectedArticleId}
            className="lg:sticky lg:top-4 lg:self-start"
          />
        </section>
      </div>

      {selectedArticleId !== null ? (
        <ArticleDetailModal
          articleId={selectedArticleId}
          onClose={() => setSelectedArticleId(null)}
        />
      ) : null}
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * CLOUD SPOTLIGHT — Newsroom Collage
 *
 * A true visual collage using desktop 2-column grid height-matching:
 * Left card spans full-height, right matches via top horizontal overlay + bottom grid.
 * ─────────────────────────────────────────────────────────────────────────── */

function CloudSpotlightCollage({
  articles,
  onArticleClick,
}: {
  articles: NewsArticle[];
  onArticleClick: (id: string) => void;
}) {
  const [lead, item1, item2, item3] = articles;
  if (!lead) return null;

  return (
    <>
      {/* Desktop: collage grid */}
      <div className={cn("hidden md:grid", articles.length > 1 ? "cloud-spotlight-grid" : "grid-cols-1")}>
        {/* Left: Large lead overlay card */}
        <NewsCard
          article={lead}
          onClick={onArticleClick}
          variant="overlay"
          className={cn("h-full min-h-[412px]", articles.length === 1 && "w-full")}
        />
        {articles.length > 1 ? (
          /* Right: Stacked overlay items matching left height */
          <div className="flex flex-col gap-3 h-full">
            {item1 ? (
              <NewsCard
                article={item1}
                onClick={onArticleClick}
                variant="overlay"
                className={cn(
                  (!item2 && !item3) ? "flex-1 h-full" : "h-[200px]"
                )}
              />
            ) : null}
            {item2 || item3 ? (
              <div className={cn("grid gap-3 flex-1", (item2 && item3) ? "grid-cols-2" : "grid-cols-1")}>
                {item2 ? (
                  <NewsCard
                    article={item2}
                    onClick={onArticleClick}
                    variant="overlay"
                    className="h-full min-h-[200px]"
                  />
                ) : null}
                {item3 ? (
                  <NewsCard
                    article={item3}
                    onClick={onArticleClick}
                    variant="overlay"
                    className="h-full min-h-[200px]"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Mobile: stacked editorial layout */}
      <div className="grid gap-4 md:hidden">
        <NewsCard
          article={lead}
          onClick={onArticleClick}
          variant="overlay"
          className="min-h-[220px]"
        />
        {item1 ? (
          <NewsCard
            article={item1}
            onClick={onArticleClick}
            variant="flat-editorial"
          />
        ) : null}
        {item2 || item3 ? (
          <div className="flex flex-col gap-3">
            {([item2, item3].filter(Boolean) as NewsArticle[]).map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={onArticleClick}
                variant="flat-horizontal"
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * AI & EMERGING TECH — Featured + Editorial Summary Rail
 *
 * Featured flat editorial (no border) and a rail of flat horizontal/quotes.
 * Totally distinct identity from the overlay collage.
 * ─────────────────────────────────────────────────────────────────────────── */

function AiEmergingLayout({
  articles,
  onArticleClick,
}: {
  articles: NewsArticle[];
  onArticleClick: (id: string) => void;
}) {
  const [featured, ...others] = articles;
  if (!featured) return null;

  return (
    <>
      {/* Desktop Layout */}
      <div className={cn(
        "hidden md:grid",
        others.length === 1 ? "grid-cols-2 gap-5" :
        others.length === 2 ? "grid-cols-3 gap-5" :
        others.length > 2 ? "ai-emerging-grid" : "grid-cols-1"
      )}>
        {/* Left Column: Featured editorial article */}
        {others.length === 2 ? (
          <NewsCard
            article={featured}
            onClick={onArticleClick}
            variant="flat-editorial"
          />
        ) : (
          <NewsCard
            article={featured}
            onClick={onArticleClick}
            variant="flat-editorial"
            className={cn(others.length === 0 && "w-full")}
          />
        )}
        {others.length > 0 ? (
          /* Right Column: Compact Rail & Summaries */
          others.length === 1 ? (
            <NewsCard
              article={others[0]}
              onClick={onArticleClick}
              variant="flat-editorial"
            />
          ) : others.length === 2 ? (
            <>
              <NewsCard
                article={others[0]}
                onClick={onArticleClick}
                variant="flat-editorial"
              />
              <NewsCard
                article={others[1]}
                onClick={onArticleClick}
                variant="flat-editorial"
              />
            </>
          ) : (
            <div className="flex flex-col gap-3.5 justify-start">
              <div className="flex flex-col gap-3.5">
                {others.slice(0, 2).map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onClick={onArticleClick}
                    variant="flat-horizontal"
                  />
                ))}
              </div>
              {others[2] ? (
                <NewsCard
                  article={others[2]}
                  onClick={onArticleClick}
                  variant="quote"
                />
              ) : null}
            </div>
          )
        ) : null}
      </div>

      {/* Mobile Layout */}
      <div className="grid gap-4 md:hidden">
        <NewsCard
          article={featured}
          onClick={onArticleClick}
          variant="flat-editorial"
        />
        {others.length > 0 ? others.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onClick={onArticleClick}
            variant="flat-horizontal"
          />
        )) : null}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SECURITY WATCH — Briefing Bulletin
 *
 * Dark-themed ops warning bulletin with threat-logs and alert metrics.
 * ─────────────────────────────────────────────────────────────────────────── */

function SecurityBulletin({
  articles,
  onArticleClick,
  className,
}: {
  articles: NewsArticle[];
  onArticleClick: (id: string) => void;
  className?: string;
}) {
  const [lead, ...others] = articles;
  if (!lead) return null;

  return (
    <section className={className}>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-white/5 bg-[#131921] text-[#f3f4f6] shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {/* Bulletin Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-black/20">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <h2 className="font-display text-sm font-semibold text-red-400">
              Security Watch
            </h2>
          </div>
          <span className="text-[9px] font-mono text-white/50 tracking-wider">
            STATUS: ACTIVE INTEL
          </span>
        </div>

        <div className={cn(others.length > 0 ? "security-bulletin-grid" : "grid grid-cols-1")}>
          {/* Lead story as overlay */}
          <button
            type="button"
            aria-label={`Open article: ${lead.title}`}
            onClick={() => onArticleClick(lead.id)}
            className="group relative flex min-h-[260px] w-full overflow-hidden text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
          >
            <NewsImage
              src={lead.imageUrl}
              category={lead.category}
              articleId={lead.id}
              alt={lead.title}
              sizes={others.length > 0 ? "(min-width: 1024px) 50vw, 100vw" : "100vw"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131921] via-black/45 to-transparent" />
            <div className="relative flex w-full flex-col justify-end p-5">
              <span className="mb-2 inline-flex w-fit rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.06em] text-red-200 backdrop-blur-sm">
                SECURITY ADVISORY
              </span>
              <h3 className="break-words font-display text-[15px] font-semibold leading-[1.3] tracking-tight text-white group-hover:text-red-300 transition-colors duration-200">
                {lead.title}
              </h3>
              {lead.aiSummary ? (
                <p className="mt-2 line-clamp-2 text-[12px] leading-[1.45] text-white/70">
                  {lead.aiSummary}
                </p>
              ) : null}
              <p className="mt-3 text-[10px] font-mono text-white/40">
                REF: {lead.sourceName} {"·"} {formatPublishedDate(lead.publishedAt)}
              </p>
            </div>
          </button>

          {/* Incident logs/briefing feed */}
          {others.length > 0 ? (
            <div className="flex flex-col border-t border-white/10 p-5 lg:border-l lg:border-t-0">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.06em] text-white/40">
                  {"// LATEST INCIDENT LOGS"}
                </p>
                <div className="flex flex-col">
                  {others.map((article, index) => {
                    const tags = ["HIGH", "INFO", "CRITICAL"];
                    const tag = tags[index % tags.length];
                    const tagColor =
                      tag === "CRITICAL"
                        ? "text-red-400 bg-red-500/10 border-red-500/30"
                        : tag === "HIGH"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                          : "text-blue-400 bg-blue-500/10 border-blue-500/30";

                    return (
                      <button
                        key={article.id}
                        type="button"
                        aria-label={`Open article: ${article.title}`}
                        onClick={() => onArticleClick(article.id)}
                        className="group block w-full border-b border-white/5 py-2.5 text-left transition last:border-b-0 last:pb-0 first:pt-0 focus:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded border px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider", tagColor)}>
                            {tag}
                          </span>
                          <span className="font-mono text-[9px] text-white/30">
                            {formatPublishedDate(article.publishedAt)}
                          </span>
                        </div>
                        <span className="mt-1.5 block text-[13px] font-semibold leading-[1.4] text-white/90 transition-colors duration-200 group-hover:text-red-300">
                          {article.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * TRENDING STORIES — Story Rail
 *
 * Horizontal media strip layout (snap scroll + custom controls, outline numbering).
 * ─────────────────────────────────────────────────────────────────────────── */

function TrendingStoryRail({
  articles,
  onArticleClick,
  className,
}: {
  articles: NewsArticle[];
  onArticleClick: (id: string) => void;
  className?: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="relative mb-2.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#232F3E]" />
            <h2 className="font-display text-base font-semibold text-[#232F3E]">
              Trending Stories
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Fast-moving stories worth scanning before your next build session.
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((article, index) => (
            <button
              key={article.id}
              type="button"
              aria-label={`Open article: ${article.title}`}
              onClick={() => onArticleClick(article.id)}
              className="group trending-card shrink-0 snap-start focus:outline-none cursor-pointer"
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                textAlign: 'left',
                backgroundColor: '#131921',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: '16px',
                }}
              >
                <NewsImage
                  src={article.imageUrl}
                  category={article.category}
                  articleId={article.id}
                  alt={article.title}
                  sizes="200px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                />
                <div 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.1) 100%)',
                    zIndex: 1
                  }}
                />
                <span 
                  className="font-display text-3xl font-bold tracking-tight"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '14px',
                    color: 'rgba(255, 255, 255, 0.2)',
                    zIndex: 2
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '14px',
                    zIndex: 3,
                    boxSizing: 'border-box'
                  }}
                >
                  <span className="mb-1 inline-flex w-fit rounded-full bg-white/15 border border-white/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.06em] text-white backdrop-blur-sm">
                    {getCategoryLabel(article.category)}
                  </span>
                  <h3 className="break-words font-display text-[13px] font-semibold leading-[1.3] tracking-tight text-white group-hover:text-[#B07024] transition-colors duration-200">
                    {article.title}
                  </h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * EDITORIAL SECTION HEADER (Newspaper typography & dot accent lines)
 * ─────────────────────────────────────────────────────────────────────────── */

type EditorialSectionProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

function EditorialSection({
  title,
  subtitle,
  children,
  className,
}: EditorialSectionProps) {
  return (
    <section className={className}>
      <div className="relative mb-3 flex flex-col justify-start">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#232F3E]" />
          <h2 className="font-display text-base font-semibold text-[#232F3E]">
            {title}
          </h2>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted max-w-3xl">
          {subtitle}
        </p>
      </div>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * BALANCED MASONRY (Enriched variety, no canyon, tight margins)
 * ─────────────────────────────────────────────────────────────────────────── */

type BalancedMasonryProps = {
  articles: NewsArticle[];
  onArticleClick: (articleId: string) => void;
};

type MasonryItem = {
  article: NewsArticle;
  variant:
    | "standard"
    | "large"
    | "compact"
    | "overlay"
    | "headline"
    | "flat-editorial"
    | "flat-horizontal"
    | "quote";
};

function BalancedMasonry({
  articles,
  onArticleClick,
}: BalancedMasonryProps) {
  const activeTwoColumns = Math.min(articles.length, 2);
  const activeThreeColumns = Math.min(articles.length, 3);

  const twoColumnLayout = buildBalancedMasonryColumns(articles, activeTwoColumns);
  const threeColumnLayout = buildBalancedMasonryColumns(articles, activeThreeColumns);

  return (
    <>
      <div className="grid gap-3.5 md:hidden">
        {articles.map((article, index) => (
          <NewsCard
            key={article.id}
            article={article}
            onClick={onArticleClick}
            variant={getMasonryVariant(article, index)}
          />
        ))}
      </div>

      <div className={cn(
        "hidden gap-3.5 md:grid xl:hidden",
        activeTwoColumns === 2 ? "grid-cols-2" : "grid-cols-1"
      )}>
        {twoColumnLayout.map((column, columnIndex) => (
          <div key={columnIndex} className="grid content-start gap-3.5">
            {column.map((item) => (
              <NewsCard
                key={item.article.id}
                article={item.article}
                onClick={onArticleClick}
                variant={item.variant}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={cn(
        "hidden gap-3.5 xl:grid",
        activeThreeColumns === 3 ? "grid-cols-3" : activeThreeColumns === 2 ? "grid-cols-2" : "grid-cols-1"
      )}>
        {threeColumnLayout.map((column, columnIndex) => (
          <div key={columnIndex} className="grid content-start gap-3.5">
            {column.map((item) => (
              <NewsCard
                key={item.article.id}
                article={item.article}
                onClick={onArticleClick}
                variant={item.variant}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function buildBalancedMasonryColumns(
  articles: NewsArticle[],
  columnCount: number,
) {
  const columns = Array.from({ length: columnCount }, () => [] as MasonryItem[]);

  // Simple round-robin: articles alternate columns top-to-bottom
  // This keeps column heights naturally balanced without bin-packing skew
  articles.forEach((article, index) => {
    const columnIndex = index % columnCount;
    const variant = getMasonryVariant(article, index);
    columns[columnIndex].push({ article, variant });
  });

  return columns;
}

function getLightestColumnIndex(columnWeights: number[]) {
  return columnWeights.reduce(
    (lightestIndex, currentWeight, currentIndex) =>
      currentWeight < columnWeights[lightestIndex]
        ? currentIndex
        : lightestIndex,
    0,
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * NEWSROOM SECTION BUILDER
 * ─────────────────────────────────────────────────────────────────────────── */

function buildNewsroomSections(articles: NewsArticle[]) {
  const usedArticleIds = new Set<string>();
  const featured = articles[0];

  if (featured) {
    usedArticleIds.add(featured.id);
  }

  const editorHighlights = selectArticles({
    articles,
    usedArticleIds,
    limit: 3,
    fillWithLatest: true,
  });
  const cloudSpotlight = selectArticles({
    articles,
    usedArticleIds,
    limit: 4,
    predicate: (article) => isCloudCategory(article.category),
    fillWithLatest: true,
  });
  const aiEmerging = selectArticles({
    articles,
    usedArticleIds,
    limit: 4,
    predicate: isAiArticle,
    fillWithLatest: true,
  });
  const securityWatch = selectArticles({
    articles,
    usedArticleIds,
    limit: 4,
    predicate: isSecurityArticle,
    fillWithLatest: true,
  });
  const trending = selectArticles({
    articles,
    usedArticleIds,
    limit: 6,
    fillWithLatest: true,
  });
  const latestUpdates = articles
    .filter((article) => !usedArticleIds.has(article.id))
    .slice(0, 6);

  return {
    featured,
    editorHighlights,
    cloudSpotlight,
    aiEmerging,
    securityWatch,
    trending,
    latestUpdates,
  };
}

function selectArticles({
  articles,
  usedArticleIds,
  limit,
  predicate = () => true,
  fillWithLatest = false,
}: {
  articles: NewsArticle[];
  usedArticleIds: Set<string>;
  limit: number;
  predicate?: (article: NewsArticle) => boolean;
  fillWithLatest?: boolean;
}) {
  const selectedArticles: NewsArticle[] = [];

  for (const article of articles) {
    if (selectedArticles.length >= limit) {
      break;
    }

    if (!usedArticleIds.has(article.id) && predicate(article)) {
      selectedArticles.push(article);
    }
  }

  if (fillWithLatest && selectedArticles.length < limit) {
    for (const article of articles) {
      if (selectedArticles.length >= limit) {
        break;
      }

      if (
        !usedArticleIds.has(article.id) &&
        !selectedArticles.some((selected) => selected.id === article.id)
      ) {
        selectedArticles.push(article);
      }
    }
  }

  selectedArticles.forEach((article) => usedArticleIds.add(article.id));

  return selectedArticles;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ARTICLE CLASSIFICATION HELPERS
 * ─────────────────────────────────────────────────────────────────────────── */

function isAiArticle(article: NewsArticle) {
  const searchableText = `${article.category ?? ""} ${article.title} ${
    article.aiSummary ?? ""
  }`.toLowerCase();

  return (
    article.category === "AI" ||
    /\bai\b/.test(searchableText) ||
    searchableText.includes("machine learning") ||
    searchableText.includes("llm") ||
    searchableText.includes("agent") ||
    searchableText.includes("bedrock") ||
    searchableText.includes("claude")
  );
}

function isSecurityArticle(article: NewsArticle) {
  const searchableText = `${article.category ?? ""} ${article.title} ${
    article.aiSummary ?? ""
  }`.toLowerCase();

  return (
    article.category === "CYBERSECURITY" ||
    searchableText.includes("security") ||
    searchableText.includes("cyber") ||
    searchableText.includes("privacy") ||
    searchableText.includes("vulnerability")
  );
}

function isLargeCardCandidate(article: NewsArticle) {
  const hasRealImage = Boolean(article.imageUrl?.trim());
  const hasEnoughContent =
    Boolean(article.aiSummary?.trim()) || article.title.length >= 88;

  return hasRealImage && hasEnoughContent;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MASONRY VARIANT SELECTION — Increased variation
 *
 * Pattern: overlay (rare), headline (occasional), compact (frequent),
 *          standard (dominant), large (very rare), flat-editorial (frequent),
 *          flat-horizontal (occasional), quote (occasional)
 * ─────────────────────────────────────────────────────────────────────────── */

function getMasonryVariant(
  article: NewsArticle,
  index: number,
):
  | "standard"
  | "large"
  | "compact"
  | "overlay"
  | "headline"
  | "flat-editorial"
  | "flat-horizontal"
  | "quote" {
  const hasImage = Boolean(article.imageUrl?.trim());
  const cycle = index % 8;

  if (cycle === 0) return hasImage ? "flat-editorial" : "headline";
  if (cycle === 1) return "standard";
  if (cycle === 2) return "quote";
  if (cycle === 3) return "compact";
  if (cycle === 4) return hasImage ? "flat-horizontal" : "quote";
  if (cycle === 5) return "standard";
  if (cycle === 6) return "headline";
  return hasImage ? "flat-editorial" : "standard";
}

function estimateMasonryWeight(
  article: NewsArticle,
  variant:
    | "standard"
    | "large"
    | "compact"
    | "overlay"
    | "headline"
    | "flat-editorial"
    | "flat-horizontal"
    | "quote",
) {
  const variantWeight: Record<string, number> = {
    headline: 0.35,
    quote: 0.5,
    "flat-horizontal": 0.45,
    "flat-editorial": 1.4,
    compact: 1.25,
    standard: 1.6,
    overlay: 1.0,
    large: 1.75,
  };
  const weight = variantWeight[variant] ?? 1;

  // Account for actual title length
  const titleLength = article.title.length;
  const titleWeight =
    titleLength < 40
      ? 0.05
      : titleLength < 70
        ? 0.1
        : Math.min(titleLength / 100, 0.25);

  const summaryWeight = article.aiSummary ? 0.15 : 0;
  const hasFullWidthImage =
    Boolean(article.imageUrl?.trim()) &&
    ["standard", "large", "compact", "overlay", "flat-editorial"].includes(variant);
  const imageBonus = hasFullWidthImage ? 0.8 : 0;

  return weight + titleWeight + summaryWeight + imageBonus;
}
