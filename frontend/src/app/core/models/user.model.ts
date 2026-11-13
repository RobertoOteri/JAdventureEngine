export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  publishedAdventures?: number;
  completedAdventures?: number;
  reviewsWritten?: number;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}
