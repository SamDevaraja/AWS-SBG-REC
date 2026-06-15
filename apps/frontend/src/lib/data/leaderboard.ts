export interface LeaderboardUser {
  name: string;
  points: number;
  rank: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export const leaderboardUsers: LeaderboardUser[] = [];
