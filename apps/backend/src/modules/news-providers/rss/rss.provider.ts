import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { RSS_FEEDS } from '../constants/news-sources.constants';
import { INewsProvider } from '../interfaces/news-provider.interface';
import { NormalizedArticle } from '../models/normalized-article.interface';
import { normalizeRssItem } from '../normalizers/rss.normalizer';

@Injectable()
export class RssProvider implements INewsProvider {
  private readonly logger = new Logger(RssProvider.name);
  private readonly parser = new Parser({
    timeout: 15_000,
    headers: {
      'User-Agent': 'AWS-Newsfeed/1.0',
    },
  });

  async getArticles(): Promise<NormalizedArticle[]> {
    const feedResults = await Promise.all(
      RSS_FEEDS.map((feed) => this.fetchFeed(feed)),
    );

    const articles = feedResults
      .flat()
      .sort((a, b) => {
        const aTime = a.publishedAt?.getTime() ?? 0;
        const bTime = b.publishedAt?.getTime() ?? 0;

        return bTime - aTime;
      })
      .slice(0, 100);

    this.logger.log(`Fetched ${articles.length} articles from RSS`);

    return articles;
  }

  private async fetchFeed(
    feed: (typeof RSS_FEEDS)[number],
  ): Promise<NormalizedArticle[]> {
    try {
      const parsedFeed = await this.parser.parseURL(feed.url);

      return parsedFeed.items
        .map((item) => normalizeRssItem(item, feed))
        .filter((article): article is NormalizedArticle => article !== null);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch RSS feed "${feed.sourceName}" (${feed.url}): ${this.formatError(error)}`,
      );

      return [];
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
