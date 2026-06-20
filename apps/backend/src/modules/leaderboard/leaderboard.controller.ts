import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { LeaderboardMeResponseDto } from './dto/leaderboard-me-response.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * GET /leaderboard
   * Fetches the global leaderboard or filters by query.search.
   * Leverages validation pipe for query parsing.
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getLeaderboard(
    @Request() req: any,
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    const currentUserId = req.user?.id || null;
    return this.leaderboardService.getLeaderboard(currentUserId, query.search);
  }

  /**
   * GET /leaderboard/me
   * Fetches the current authenticated user's leaderboard position.
   * Throws 404 NotFoundException if the user is not found or not an ENTHUSIAST.
   */
  @Get('me')
  async getMyStatus(
    @Request() req: any,
  ): Promise<LeaderboardMeResponseDto> {
    const currentUserId = req.user?.id;
    return this.leaderboardService.getCurrentUserStatus(currentUserId);
  }
}
