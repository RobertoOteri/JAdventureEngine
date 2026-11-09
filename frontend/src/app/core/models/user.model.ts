export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}
