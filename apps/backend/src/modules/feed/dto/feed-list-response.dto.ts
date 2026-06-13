import { GetFeedResponseDto } from './get-feed-response.dto';

export class FeedListResponseDto {
  items!: GetFeedResponseDto[];
  total!: number;
}
