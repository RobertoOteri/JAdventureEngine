import { GraphicAdventureDto } from './adventure.model';
import { Action } from './action.model';

export interface InventoryItem {
  id?: number;
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  graphicAdventureDto?: GraphicAdventureDto;
  actions?: Action[];
}
