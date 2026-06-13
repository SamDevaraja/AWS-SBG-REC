import { Injectable } from '@nestjs/common';
import { INewsProvider } from './interfaces/news-provider.interface';
import { NewsApiProvider } from './newsapi/newsapi.provider';
import { RssProvider } from './rss/rss.provider';

@Injectable()
export class ProviderFactory {
  constructor(
    private readonly newsApiProvider: NewsApiProvider,
    private readonly rssProvider: RssProvider,
  ) {}

  getNewsApiProvider(): INewsProvider {
    return this.newsApiProvider;
  }

  getRssProvider(): INewsProvider {
    return this.rssProvider;
  }
}
