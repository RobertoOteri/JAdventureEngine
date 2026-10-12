import { GraphicAdventureDto } from './adventure.model';

export interface InventoryItem {
  id?: number;
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  graphicAdventureDto?: GraphicAdventureDto;
}
