import { InventoryItem } from './inventory-item.model';
import { Scene } from './scene.model';

export interface GameStateDto {
  currentScene: Scene;
  inventory: InventoryItem[];
  adventureFlags: Record<string, string>;
  visibleItemCodes: string[];
  playTime: number;
  completed?: boolean;
}
