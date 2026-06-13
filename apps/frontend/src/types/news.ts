export type NewsCategory =
  | "AWS"
  | "AZURE"
  | "GCP"
  | "CLOUD"
  | "AI"
  | "DEVOPS"
  | "CYBERSECURITY"
  | "PROGRAMMING"
  | "GENERAL";

export type NewsArticle = {
  id: string;
  title: string;
  aiSummary: string | null;
  imageUrl: string | null;
  sourceName: string;
  category: NewsCategory | null;
  publishedAt: string | null;
};

export type NewsArticleDetail = NewsArticle & {
  description: string | null;
  fullContent: string | null;
  articleUrl: string;
};

export type FeedResponse = {
  items: NewsArticle[];
  total: number;
};
