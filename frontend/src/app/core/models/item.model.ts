import { Action } from './action.model';
import { InventoryItem } from './inventory-item.model';
import { Scene } from './scene.model';

export interface Item {
  id?: number;
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
  sceneDto?: Scene;
}
