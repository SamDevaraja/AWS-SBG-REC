import type { NewsArticle, NewsCategory } from "@/types/news";

const cloudCategories = new Set<NewsCategory>(["AWS", "AZURE", "GCP", "CLOUD"]);
const cloudCategoryOrder: NewsCategory[] = ["AWS", "AZURE", "GCP", "CLOUD"];

export function getCategoryLabel(category: NewsCategory | null) {
  return category ?? "GENERAL";
}

export function isCloudCategory(category: NewsCategory | null) {
  return category !== null && cloudCategories.has(category);
}

export function formatPublishedDate(value: string | null) {
  if (value === null) {
    return "Date unavailable";
  }

  if (getPublishedTime(value) === 0) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getPublishedTime(value: string | null) {
  if (value === null) {
    return 0;
  }

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

export function formatRelativeTime(value: string | null) {
  if (value === null) {
    return "Recently";
  }

  const publishedAt = new Date(value).getTime();
  const diffMs = Date.now() - publishedAt;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  return formatPublishedDate(value);
}

export function getCloudHeadlines(articles: NewsArticle[], limit = 10) {
  const sortNewestFirst = (first: NewsArticle, second: NewsArticle) =>
    getPublishedTime(second.publishedAt) - getPublishedTime(first.publishedAt);
  const prioritizedArticles = cloudCategoryOrder.flatMap((category) =>
    articles
      .filter((article) => article.category === category)
      .sort(sortNewestFirst),
  );
  const remainingArticles = articles
    .filter((article) => !isCloudCategory(article.category))
    .sort(sortNewestFirst);

  return [...prioritizedArticles, ...remainingArticles].slice(0, limit);
}

export function splitArticleContent(content: string | null) {
  if (content === null) {
    return [];
  }

  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs;
  }

  const sentences =
    content
      .match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [];

  if (sentences.length === 0) {
    return paragraphs;
  }

  const groupedParagraphs: string[] = [];

  for (let index = 0; index < sentences.length; index += 3) {
    groupedParagraphs.push(sentences.slice(index, index + 3).join(" "));
  }

  return groupedParagraphs;
}
