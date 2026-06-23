import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { ENV_KEYS } from '../../config/env.keys';
import {
  NEWS_API_ENDPOINTS,
  NEWS_API_QUERY,
} from '../constants/news-sources.constants';
import { INewsProvider } from '../interfaces/news-provider.interface';
import { NormalizedArticle } from '../models/normalized-article.interface';
import { normalizeNewsApiArticle } from '../normalizers/newsapi.normalizer';
import { NewsApiResponse } from './newsapi.types';

@Injectable()
export class NewsApiProvider implements INewsProvider {
  private readonly logger = new Logger(NewsApiProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async getArticles(): Promise<NormalizedArticle[]> {
    const apiKey = this.configService.get<string>(ENV_KEYS.NEWS_API_KEY);

    if (!apiKey) {
      throw new InternalServerErrorException(
        'NEWS_API_KEY is not configured',
      );
    }

    try {
      const response = await axios.get<NewsApiResponse>(
        NEWS_API_ENDPOINTS.EVERYTHING,
        {
          params: {
            q: NEWS_API_QUERY.KEYWORDS,
            domains: NEWS_API_QUERY.DOMAINS,
            language: NEWS_API_QUERY.LANGUAGE,
            sortBy: NEWS_API_QUERY.SORT_BY,
            pageSize: NEWS_API_QUERY.PAGE_SIZE,
            apiKey,
          },
          timeout: 15_000,
        },
      );

      if (response.data.status !== 'ok') {
        throw new ServiceUnavailableException(
          'NewsAPI returned a non-ok status',
        );
      }

      const articles = response.data.articles
        .map((article) => normalizeNewsApiArticle(article))
        .filter((article): article is NormalizedArticle => article !== null);

      this.logger.log(`Fetched ${articles.length} articles from NewsAPI`);

      return articles;
    } catch (error) {
      this.logger.error('NewsAPI fetch failed', this.formatError(error));

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new ServiceUnavailableException(
          'Failed to fetch articles from NewsAPI',
        );
      }

      throw new ServiceUnavailableException(
        'An unexpected error occurred while fetching NewsAPI articles',
      );
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
