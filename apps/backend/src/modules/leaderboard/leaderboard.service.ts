import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { LeaderboardResponseDto, LeaderboardUserDto, LeaderboardRowDto } from './dto/leaderboard-response.dto';
import { LeaderboardMeResponseDto } from './dto/leaderboard-me-response.dto';
import { RankedUserRow } from './interfaces/leaderboard.interface';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the leaderboard data, supporting global leaderboard and name search.
   * Both paths compute ranks dynamically on ENTHUSIAST users.
   */
  async getLeaderboard(currentUserId: string | null, search?: string): Promise<LeaderboardResponseDto> {
    try {
      if (search && search.trim().length > 0) {
        return await this.getLeaderboardWithSearch(currentUserId, search.trim());
      }
      return await this.getGlobalLeaderboard(currentUserId);
    } catch (error: any) {
      this.logger.error(`Failed to retrieve leaderboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves leaderboard statistics for the logged-in user.
   * Throws NotFoundException if the user is not found or is not an ENTHUSIAST.
   */
  async getCurrentUserStatus(currentUserId: string): Promise<LeaderboardMeResponseDto> {
    try {
      const results = await this.prisma.$queryRaw<Omit<RankedUserRow, 'row_num'>[]>`
        WITH RankedUsers AS (
          SELECT
            id AS "userId",
            ("firstName" || ' ' || "lastName") AS name,
            (COALESCE(xp, 0) + COALESCE(eventxp, 0)) AS "cloudCredits",
            RANK() OVER (ORDER BY (COALESCE(xp, 0) + COALESCE(eventxp, 0)) DESC)::integer AS rank
          FROM "User"
          WHERE role = 'enthusiasts'
        )
        SELECT name, "cloudCredits", rank
        FROM RankedUsers
        WHERE "userId" = ${currentUserId};
      `;

      if (!results || results.length === 0) {
        throw new NotFoundException(
          `User with ID ${currentUserId} is not ranked on the leaderboard because they are not an ENTHUSIAST.`
        );
      }

      const userRow = results[0];
      return {
        rank: userRow.rank,
        cloudCredits: userRow.cloudCredits,
        name: userRow.name,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve current user status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Internal method: Fetch global leaderboard with Top 3 + Context logic.
   */
  private async getGlobalLeaderboard(currentUserId: string | null): Promise<LeaderboardResponseDto> {
    // Single query roundtrip to get top 3, current user rank, and context rows (above and below)
    const results = await this.prisma.$queryRaw<RankedUserRow[]>`
      WITH RankedUsers AS (
        SELECT
          id AS "userId",
          ("firstName" || ' ' || "lastName") AS name,
          (COALESCE(xp, 0) + COALESCE(eventxp, 0)) AS "cloudCredits",
          RANK() OVER (ORDER BY (COALESCE(xp, 0) + COALESCE(eventxp, 0)) DESC)::integer AS rank,
          ROW_NUMBER() OVER (
            ORDER BY 
              (COALESCE(xp, 0) + COALESCE(eventxp, 0)) DESC, 
              COALESCE(eventxp, 0) DESC, 
              "updatedAt" DESC, 
              id ASC
          )::integer AS row_num
        FROM "User"
        WHERE role = 'enthusiasts'
      ),
      CurrentUserDetails AS (
        SELECT "userId", rank, row_num
        FROM RankedUsers
        WHERE "userId" = ${currentUserId}
      )
      SELECT 
        r."userId",
        r.name,
        r."cloudCredits",
        r.rank,
        r.row_num
      FROM RankedUsers r
      LEFT JOIN CurrentUserDetails c ON TRUE
      WHERE 
        r.row_num <= 3
        OR
        ((c.row_num <= 3 OR c.row_num IS NULL) AND r.row_num > 3 AND r.row_num <= 6)
        OR
        (c.row_num > 3 AND r.row_num >= c.row_num - 1 AND r.row_num <= c.row_num + 1)
      ORDER BY r.row_num ASC;
    `;

    const topThreeRaw = results.filter((r) => r.row_num <= 3);
    const topThreeDtos: LeaderboardRowDto[] = topThreeRaw.map((r) => ({
      isDivider: false,
      rank: r.rank,
      userId: r.userId,
      name: r.name,
      cloudCredits: r.cloudCredits,
      isCurrentUser: r.userId === currentUserId,
    }));

    const currentUserRaw = results.find((r) => r.userId === currentUserId);
    const currentUser: LeaderboardUserDto | null = currentUserRaw
      ? {
          rank: currentUserRaw.rank,
          userId: currentUserRaw.userId,
          name: currentUserRaw.name,
          cloudCredits: currentUserRaw.cloudCredits,
        }
      : null;

    let displayUsers: LeaderboardRowDto[] = [];

    if (currentUserRaw && currentUserRaw.row_num > 4) {
      // Case B: User is outside Top 3
      // We show: Top 3, then a Divider, then User Above, Current User, and User Below.
      displayUsers.push(...topThreeDtos);
      displayUsers.push({ isDivider: true });

      const aboveUser = results.find((r) => r.row_num === currentUserRaw.row_num - 1);
      const belowUser = results.find((r) => r.row_num === currentUserRaw.row_num + 1);

      if (aboveUser) {
        displayUsers.push({
          isDivider: false,
          rank: aboveUser.rank,
          userId: aboveUser.userId,
          name: aboveUser.name,
          cloudCredits: aboveUser.cloudCredits,
          isCurrentUser: aboveUser.userId === currentUserId, // always false but keeps code consistent
        });
      }

      displayUsers.push({
        isDivider: false,
        rank: currentUserRaw.rank,
        userId: currentUserRaw.userId,
        name: currentUserRaw.name,
        cloudCredits: currentUserRaw.cloudCredits,
        isCurrentUser: true,
      });

      if (belowUser) {
        displayUsers.push({
          isDivider: false,
          rank: belowUser.rank,
          userId: belowUser.userId,
          name: belowUser.name,
          cloudCredits: belowUser.cloudCredits,
          isCurrentUser: belowUser.userId === currentUserId,
        });
      }
    } else {
      // Case A: Current User is in Top 3, or the user is not found/not an ENTHUSIAST
      // Show continuous list of rows 1 to 6 (no divider)
      displayUsers = results.slice(0, 6).map((r) => ({
        isDivider: false,
        rank: r.rank,
        userId: r.userId,
        name: r.name,
        cloudCredits: r.cloudCredits,
        isCurrentUser: r.userId === currentUserId,
      }));
    }

    // Programmatic deduplication failsafe to ensure no duplicate users can ever appear in displayUsers
    const uniqueDisplayUsers: LeaderboardRowDto[] = [];
    const seenUserIds = new Set<string>();
    for (const row of displayUsers) {
      if (row.isDivider) {
        uniqueDisplayUsers.push(row);
      } else if (row.userId && !seenUserIds.has(row.userId)) {
        seenUserIds.add(row.userId);
        uniqueDisplayUsers.push(row);
      }
    }

    return {
      currentUser,
      displayUsers: uniqueDisplayUsers,
    };
  }

  /**
   * Internal method: Fetch filtered leaderboard using ILIKE search with global ranks.
   */
  private async getLeaderboardWithSearch(currentUserId: string | null, search: string): Promise<LeaderboardResponseDto> {
    const searchPattern = `%${search}%`;

    // Query 1: Fetch current user global ranking context
    const userContextResults = await this.prisma.$queryRaw<Omit<RankedUserRow, 'row_num'>[]>`
      WITH RankedUsers AS (
        SELECT
          id AS "userId",
          ("firstName" || ' ' || "lastName") AS name,
          (COALESCE(xp, 0) + COALESCE(eventxp, 0)) AS "cloudCredits",
          RANK() OVER (ORDER BY (COALESCE(xp, 0) + COALESCE(eventxp, 0)) DESC)::integer AS rank
        FROM "User"
        WHERE role = 'enthusiasts'
      )
      SELECT * FROM RankedUsers 
      WHERE "userId" = ${currentUserId};
    `;

    const currentUserRaw = userContextResults[0];
    const currentUser: LeaderboardUserDto | null = currentUserRaw
      ? {
          rank: currentUserRaw.rank,
          userId: currentUserRaw.userId,
          name: currentUserRaw.name,
          cloudCredits: currentUserRaw.cloudCredits,
        }
      : null;

    // Query 2: Fetch searched matching users
    const searchResults = await this.prisma.$queryRaw<Omit<RankedUserRow, 'row_num'>[]>`
      WITH RankedUsers AS (
        SELECT
          id AS "userId",
          ("firstName" || ' ' || "lastName") AS name,
          (COALESCE(xp, 0) + COALESCE(eventxp, 0)) AS "cloudCredits",
          RANK() OVER (ORDER BY (COALESCE(xp, 0) + COALESCE(eventxp, 0)) DESC)::integer AS rank,
          COALESCE(eventxp, 0) AS "eventxp",
          "updatedAt",
          id
        FROM "User"
        WHERE role = 'enthusiasts'
      )
      SELECT "userId", name, "cloudCredits", rank FROM RankedUsers 
      WHERE name ILIKE ${searchPattern} 
      ORDER BY 
        rank ASC, 
        "eventxp" DESC, 
        "updatedAt" DESC, 
        id ASC
      LIMIT 50;
    `;

    const displayUsers: LeaderboardRowDto[] = searchResults.map((r) => ({
      isDivider: false,
      rank: r.rank,
      userId: r.userId,
      name: r.name,
      cloudCredits: r.cloudCredits,
      isCurrentUser: r.userId === currentUserId,
    }));

    return {
      currentUser,
      displayUsers,
    };
  }
}
