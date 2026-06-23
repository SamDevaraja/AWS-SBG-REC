import { NewsCategory } from '@prisma/client';

export const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export const NEWS_API_ENDPOINTS = {
  EVERYTHING: `${NEWS_API_BASE_URL}/everything`,
} as const;

export const NEWS_API_QUERY = {
  KEYWORDS:
    'AWS OR cloud OR Azure OR "Google Cloud" OR GCP OR Kubernetes OR DevOps OR technology',
  DOMAINS:
    'techcrunch.com,thenextweb.com,wired.com,theverge.com,zdnet.com,infoworld.com,aws.amazon.com,cloud.google.com,azure.microsoft.com,venturebeat.com,arstechnica.com,siliconangle.com',
  LANGUAGE: 'en',
  SORT_BY: 'publishedAt',
  PAGE_SIZE: 100,
} as const;

export const PROVIDER_NAMES = {
  NEWSAPI: 'newsapi',
  RSS: 'rss',
} as const;

export interface RssFeedConfig {
  url: string;
  sourceName: string;
  category: NewsCategory;
}

export const RSS_FEEDS: readonly RssFeedConfig[] = [
  {
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    sourceName: "AWS What's New",
    category: 'AWS',
  },
  {
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    sourceName: 'AWS Blog',
    category: 'AWS',
  },
  {
    url: 'https://cloudblog.withgoogle.com/rss/',
    sourceName: 'Google Cloud Blog',
    category: 'GCP',
  },
  {
    url: 'https://azure.microsoft.com/en-us/blog/feed/',
    sourceName: 'Azure Blog',
    category: 'AZURE',
  },
  {
    url: 'https://techcrunch.com/feed/',
    sourceName: 'TechCrunch',
    category: 'GENERAL',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    sourceName: 'The Verge',
    category: 'GENERAL',
  },
  {
    url: 'https://openai.com/news/rss.xml',
    sourceName: 'OpenAI Blog',
    category: 'AI',
  },
] as const;
