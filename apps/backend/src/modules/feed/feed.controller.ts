import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { FeedDetailResponseDto } from './dto/feed-detail-response.dto';
import { FeedListResponseDto } from './dto/feed-list-response.dto';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getLatestFeed(): Promise<FeedListResponseDto> {
    return this.feedService.getLatestFeed();
  }

  @Get(':id')
  getFeedItemById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FeedDetailResponseDto> {
    return this.feedService.getFeedItemById(id);
  }
}
