import { GraphicAdventureDto } from './adventure.model';
import { Item } from './item.model';

export interface Scene {
  code: string;
  name: string;
  backgroundImageUrl?: string;
  items?: Item[];
  graphicAdventureDto?: GraphicAdventureDto;
}
