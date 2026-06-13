import { ExtractedArticle } from '../../article-extraction/interfaces/extracted-article.interface';

export interface SummarizedArticle extends ExtractedArticle {
  aiSummary: string | null;
}
