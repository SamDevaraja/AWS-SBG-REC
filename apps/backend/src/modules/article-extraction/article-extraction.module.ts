import { Module } from '@nestjs/common';
import { ArticleExtractionService } from './services/article-extraction.service';
import { HtmlContentExtractorService } from './services/html-content-extractor.service';

@Module({
  providers: [HtmlContentExtractorService, ArticleExtractionService],
  exports: [ArticleExtractionService],
})
export class ArticleExtractionModule {}
