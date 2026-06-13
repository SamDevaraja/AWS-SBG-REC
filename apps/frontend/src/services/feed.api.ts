import { apiClient } from "@/lib/api/client";
import type { FeedResponse, NewsArticleDetail } from "@/types/news";

export async function getFeed(): Promise<FeedResponse> {
  const response = await apiClient.get<FeedResponse>("/feed");

  return response.data;
}

export async function getArticle(id: string): Promise<NewsArticleDetail> {
  const response = await apiClient.get<NewsArticleDetail>(`/feed/${id}`);

  return response.data;
}
