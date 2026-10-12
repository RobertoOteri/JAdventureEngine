import { InventoryItem } from './inventory-item.model';
import { Scene } from './scene.model';

export interface GameStateDto {
  saveCode: string;
  currentScene: Scene;
  inventory: InventoryItem[];
  adventureFlags: Record<string, string>;
  visibleItemCodes: string[];
}
