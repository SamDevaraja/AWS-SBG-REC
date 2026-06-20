import apiClient from './roadmap.apiClient';
import { LeaderboardResponseDto, LeaderboardMeResponseDto } from '@/types/leaderboard.types';

export class LeaderboardApiService {
  /**
   * Fetch leaderboard data.
   */
  async getLeaderboard(search?: string): Promise<LeaderboardResponseDto> {
    const queryParams = new URLSearchParams();
    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }
    const url = `/leaderboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<LeaderboardResponseDto>(url);
    return response.data;
  }

  /**
   * Fetch current authenticated user's stats
   */
  async getMe(): Promise<LeaderboardMeResponseDto> {
    const response = await apiClient.get<LeaderboardMeResponseDto>('/leaderboard/me');
    return response.data;
  }
}
