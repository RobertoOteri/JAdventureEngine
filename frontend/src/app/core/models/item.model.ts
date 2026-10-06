import { Action } from './action.model';
import { InventoryItem } from './inventory-item.model';

export interface Item {
  code: string;
  name: string;
  imageUrl?: string;
  posX?: number;
  posY?: number;
  points?: string;
  width?: number;
  height?: number;
  initiallyVisible: boolean;
  actions?: Action[];
  linkedInventoryItem?: InventoryItem | null;
}
