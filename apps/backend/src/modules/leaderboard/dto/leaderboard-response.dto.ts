export class LeaderboardUserDto {
  rank: number;
  userId: string;
  name: string;
  cloudCredits: number;
}

export class LeaderboardRowDto {
  isDivider: boolean;
  rank?: number;
  userId?: string;
  name?: string;
  cloudCredits?: number;
  isCurrentUser?: boolean;
}

export class LeaderboardResponseDto {
  currentUser: LeaderboardUserDto | null;
  displayUsers: LeaderboardRowDto[];
}
