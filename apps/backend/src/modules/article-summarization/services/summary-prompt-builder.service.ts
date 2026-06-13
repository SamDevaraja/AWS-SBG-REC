import { Injectable } from '@nestjs/common';

@Injectable()
export class SummaryPromptBuilderService {
  buildPrompt(fullContent: string): string {
    return `You are a technology news analyst.

Summarize the article below.

Requirements:

- Maximum 120 words
- Neutral tone
- No marketing language
- No bullet points
- Preserve technical details
- Mention product names when relevant
- Mention AWS services when relevant

Article:

${fullContent}`;
  }
}
