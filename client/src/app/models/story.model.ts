export interface Story {
  id: number;
  userId: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  content: string;
  imageUrl?: string;
  createdAt: string;
  expiresAt: string;
  views: number;
}

export interface CreateStoryRequest {
  content: string;
}
