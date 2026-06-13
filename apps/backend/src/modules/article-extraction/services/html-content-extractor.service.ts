import { Injectable } from '@nestjs/common';
import { load, type CheerioAPI } from 'cheerio';

const MAX_CONTENT_LENGTH = 15000;
const MIN_CONTENT_LENGTH = 300;

@Injectable()
export class HtmlContentExtractorService {
  extractContent(html: string): string | null {
    const $ = load(html);

    $('script, style, nav, footer, header, aside').remove();

    const container = this.selectContainer($);

    if (!container) {
      return null;
    }

    const normalizedText = container.text().replace(/\s+/g, ' ').trim();

    if (normalizedText.length < MIN_CONTENT_LENGTH) {
      return null;
    }

    if (normalizedText.length > MAX_CONTENT_LENGTH) {
      return normalizedText.slice(0, MAX_CONTENT_LENGTH).trim();
    }

    return normalizedText;
  }

  extractImageUrl(html: string, baseUrl: string): string | null {
    const $ = load(html);

    const imageCandidates = [
      this.extractMetaImageUrl($, 'meta[property="og:image"]'),
      this.extractMetaImageUrl($, 'meta[name="twitter:image"]'),
      this.extractMetaImageUrl($, 'meta[name="twitter:image:src"]'),
      this.extractLargestContentImageUrl($),
    ];

    for (const imageCandidate of imageCandidates) {
      if (!imageCandidate) {
        continue;
      }

      const imageUrl = this.toAbsoluteImageUrl(imageCandidate, baseUrl);

      if (imageUrl) {
        return imageUrl;
      }
    }

    return null;
  }

  private selectContainer($: CheerioAPI) {
    const article = $('article').first();

    if (article.length > 0) {
      return article;
    }

    const main = $('main').first();

    if (main.length > 0) {
      return main;
    }

    const body = $('body').first();

    if (body.length > 0) {
      return body;
    }

    return null;
  }

  private extractMetaImageUrl(
    $: CheerioAPI,
    selector: string,
  ): string | null {
    return this.normalizeImageUrl($(selector).first().attr('content'));
  }

  private extractLargestContentImageUrl($: CheerioAPI): string | null {
    const container = this.selectContainer($);

    if (!container) {
      return null;
    }

    const images = container
      .find('img')
      .toArray()
      .map((image) => {
        const element = $(image);
        const src = this.normalizeImageUrl(
          element.attr('src') ??
            element.attr('data-src') ??
            element.attr('data-original') ??
            this.extractSrcSetImageUrl(
              element.attr('srcset') ?? element.attr('data-srcset'),
            ),
        );

        if (!src) {
          return null;
        }

        const width = this.parseDimension(element.attr('width'));
        const height = this.parseDimension(element.attr('height'));

        return {
          src,
          area: width * height,
        };
      })
      .filter((image): image is { src: string; area: number } => image !== null)
      .sort((left, right) => right.area - left.area);

    return images[0]?.src ?? null;
  }

  private extractSrcSetImageUrl(srcset: string | undefined): string | null {
    if (!srcset) {
      return null;
    }

    const candidates = srcset
      .split(',')
      .map((candidate) => candidate.trim().split(/\s+/)[0])
      .filter(Boolean);

    return candidates[candidates.length - 1] ?? null;
  }

  private normalizeImageUrl(url: string | null | undefined): string | null {
    const normalizedUrl = url?.trim();

    if (!normalizedUrl) {
      return null;
    }

    return normalizedUrl;
  }

  private parseDimension(value: string | undefined): number {
    const dimension = Number.parseInt(value ?? '', 10);

    if (Number.isNaN(dimension)) {
      return 0;
    }

    return dimension;
  }

  private toAbsoluteImageUrl(imageUrl: string, baseUrl: string): string | null {
    try {
      const url = new URL(imageUrl, baseUrl);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }

      return url.toString();
    } catch {
      return null;
    }
  }
}
