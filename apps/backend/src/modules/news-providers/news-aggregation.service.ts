import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { NormalizedArticle } from './models/normalized-article.interface';
import { NewsApiProvider } from './newsapi/newsapi.provider';
import { RssProvider } from './rss/rss.provider';

@Injectable()
export class NewsAggregationService {
  private readonly logger = new Logger(NewsAggregationService.name);

  constructor(
    private readonly newsApiProvider: NewsApiProvider,
    private readonly rssProvider: RssProvider,
  ) {}

  async getAllArticles(): Promise<NormalizedArticle[]> {
    let newsApiArticles: NormalizedArticle[] = [];
    let rssArticles: NormalizedArticle[] = [];
    let newsApiFailed = false;
    let rssFailed = false;

    try {
      newsApiArticles = await this.newsApiProvider.getArticles();
    } catch (error) {
      newsApiFailed = true;
      this.logger.error(
        'NewsAPI provider failed during aggregation',
        this.formatError(error),
      );
    }

    try {
      rssArticles = await this.rssProvider.getArticles();
    } catch (error) {
      rssFailed = true;
      this.logger.error(
        'RSS provider failed during aggregation',
        this.formatError(error),
      );
    }

    if (newsApiFailed && rssFailed) {
      throw new ServiceUnavailableException(
        'All news providers failed to fetch articles',
      );
    }

    const merged = [...newsApiArticles, ...rssArticles].sort((a, b) => {
      const aTime = a.publishedAt?.getTime() ?? 0;
      const bTime = b.publishedAt?.getTime() ?? 0;

      return bTime - aTime;
    });

    this.logger.log(
      `Aggregated ${merged.length} articles (${newsApiArticles.length} from NewsAPI, ${rssArticles.length} from RSS)`,
    );

    return merged;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
