import { NewsCategory } from '@prisma/client';
import { PROVIDER_NAMES } from '../constants/news-sources.constants';
import { NewsApiArticle } from '../newsapi/newsapi.types';
import { NormalizedArticle } from '../models/normalized-article.interface';
import { nullIfEmpty, parsePublishedDate } from './normalizer.utils';

const CATEGORY_KEYWORDS: ReadonlyArray<{
  keyword: string;
  category: NewsCategory;
}> = [
  { keyword: 'aws', category: 'AWS' },
  { keyword: 'amazon web services', category: 'AWS' },
  { keyword: 'azure', category: 'AZURE' },
  { keyword: 'google cloud', category: 'GCP' },
  { keyword: 'gcp', category: 'GCP' },
  { keyword: 'kubernetes', category: 'DEVOPS' },
  { keyword: 'devops', category: 'DEVOPS' },
  { keyword: 'cybersecurity', category: 'CYBERSECURITY' },
  { keyword: 'security', category: 'CYBERSECURITY' },
  { keyword: 'artificial intelligence', category: 'AI' },
  { keyword: 'openai', category: 'AI' },
  { keyword: 'machine learning', category: 'AI' },
  { keyword: 'cloud', category: 'CLOUD' },
];

function inferCategory(
  title: string,
  description: string | null,
): NewsCategory | null {
  const text = `${title} ${description ?? ''}`.toLowerCase();

  for (const { keyword, category } of CATEGORY_KEYWORDS) {
    if (text.includes(keyword)) {
      return category;
    }
  }

  return 'GENERAL';
}

export function normalizeNewsApiArticle(
  article: NewsApiArticle,
): NormalizedArticle | null {
  const title = nullIfEmpty(article.title);
  const articleUrl = nullIfEmpty(article.url);

  if (!title || !articleUrl) {
    return null;
  }

  // Filter out CJK (Chinese, Japanese, Korean) characters to avoid non-English articles
  const hasCjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(title);
  if (hasCjk) {
    return null;
  }

  // Filter out package manager registry index updates (PyPI, npm, etc.)
  const normalizedUrl = articleUrl.toLowerCase();
  const normalizedTitle = title.toLowerCase();
  if (
    normalizedUrl.includes('pypi.org') ||
    normalizedUrl.includes('npmjs.com') ||
    normalizedTitle.includes('pypi.org') ||
    normalizedTitle.includes('npmjs.com') ||
    /\b(v?\d+\.\d+\.\d+)\b$/.test(title) || // matches version at the end, e.g. "package-name v1.0.0"
    /^[a-zA-Z0-9-_]+\s+\d+\.\d+\.\d+/.test(title) // matches e.g. "package-name 1.2.3"
  ) {
    return null;
  }

  const description = nullIfEmpty(article.description);

  return {
    title,
    description,
    imageUrl: nullIfEmpty(article.urlToImage),
    sourceName: nullIfEmpty(article.source.name) ?? 'Unknown',
    sourceUrl: articleUrl,
    articleUrl,
    category: inferCategory(title, description),
    publishedAt: parsePublishedDate(article.publishedAt),
    fullContent: null,
    provider: PROVIDER_NAMES.NEWSAPI,
  };
}
