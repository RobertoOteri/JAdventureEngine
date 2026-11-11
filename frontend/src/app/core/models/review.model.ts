export interface ReviewDto {
  id?: number;
  adventureId?: number;
  versionNumber?: number;
  username?: string;
  avatarUrl?: string | null;
  rating: number;
  comment?: string | null;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingSummaryDto {
  adventureCode: string;
  averageRating: number | null;
  reviewCount: number;
  distribution: Record<string, number>;
}
