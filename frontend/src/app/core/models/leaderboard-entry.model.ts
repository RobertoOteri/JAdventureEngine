export interface LeaderboardEntryDto {
  username: string;
  avatarUrl?: string | null;
  playTime: number;
  completedAt: string;
}
