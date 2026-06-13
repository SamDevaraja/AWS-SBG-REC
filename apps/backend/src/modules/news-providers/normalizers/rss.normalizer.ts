import Parser from 'rss-parser';
import { load } from 'cheerio';
import { PROVIDER_NAMES, RssFeedConfig } from '../constants/news-sources.constants';
import { NormalizedArticle } from '../models/normalized-article.interface';
import { nullIfEmpty, parsePublishedDate } from './normalizer.utils';

type RssItem = Parser.Item;

type RssMediaField =
  | { $?: { url?: string } }
  | Array<{ $?: { url?: string } }>;

function extractMediaUrl(field: RssMediaField | undefined): string | null {
  if (!field) {
    return null;
  }

  const candidate = Array.isArray(field)
    ? field.find((item) => item.$?.url)?.$?.url
    : field.$?.url;

  return nullIfEmpty(candidate ?? null);
}

function extractImageFromHtml(html: string | null | undefined): string | null {
  if (!html) {
    return null;
  }

  const $ = load(html);
  const imageUrl = $('img')
    .map((_, image) => $(image).attr('src'))
    .get()
    .find((src) => Boolean(nullIfEmpty(src ?? null)));

  return nullIfEmpty(imageUrl ?? null);
}

function extractImageUrl(item: RssItem): string | null {
  const enclosureUrl =
    item.enclosure?.url && item.enclosure.type?.startsWith('image/')
      ? item.enclosure.url
      : null;

  if (enclosureUrl) {
    return nullIfEmpty(enclosureUrl);
  }

  const customFields = item as RssItem & {
    'content:encoded'?: string;
    'media:content'?: RssMediaField;
    'media:thumbnail'?: RssMediaField;
  };
  const mediaUrl = extractMediaUrl(customFields['media:content']);

  if (mediaUrl) {
    return mediaUrl;
  }

  const thumbnailUrl = extractMediaUrl(customFields['media:thumbnail']);

  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  return extractImageFromHtml(
    customFields['content:encoded'] ?? item.content ?? null,
  );
}

export function normalizeRssItem(
  item: RssItem,
  feed: RssFeedConfig,
): NormalizedArticle | null {
  const title = nullIfEmpty(item.title);
  const articleUrl = nullIfEmpty(item.link);

  if (!title || !articleUrl) {
    return null;
  }

  const description = nullIfEmpty(item.contentSnippet ?? item.content ?? null);

  return {
    title,
    description,
    imageUrl: extractImageUrl(item),
    sourceName: feed.sourceName,
    sourceUrl: articleUrl,
    articleUrl,
    category: feed.category,
    publishedAt: parsePublishedDate(item.isoDate ?? item.pubDate ?? null),
    fullContent: null,
    provider: PROVIDER_NAMES.RSS,
  };
}
