export interface LeaderboardUserDto {
  rank: number;
  userId: string;
  name: string;
  cloudCredits: number;
}

export interface LeaderboardRowDto {
  isDivider: boolean;
  rank?: number;
  userId?: string;
  name?: string;
  cloudCredits?: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardResponseDto {
  currentUser: LeaderboardUserDto | null;
  displayUsers: LeaderboardRowDto[];
}

export interface LeaderboardMeResponseDto {
  rank: number;
  cloudCredits: number;
  name: string;
}
