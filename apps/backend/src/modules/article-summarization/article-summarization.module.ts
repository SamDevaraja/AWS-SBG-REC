import { Module } from '@nestjs/common';
import { BedrockClientService } from './services/bedrock-client.service';
import { ArticleSummarizationService } from './services/article-summarization.service';
import { SummaryPromptBuilderService } from './services/summary-prompt-builder.service';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    BedrockClientService,
    SummaryPromptBuilderService,
    ArticleSummarizationService,
  ],
  exports: [ArticleSummarizationService],
})
export class ArticleSummarizationModule {}
