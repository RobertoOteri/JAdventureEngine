export interface GraphicAdventureDto {
  code: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  initialSceneCode?: string;
  authorUsername: string;
  createdAt: string;
}

export interface GraphicAdventureCreateRequest {
  title: string;
  description?: string;
}
