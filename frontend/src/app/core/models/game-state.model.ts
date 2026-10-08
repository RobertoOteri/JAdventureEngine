import { InventoryItem } from './inventory-item.model';
import { Scene } from './scene.model';

export interface GameStateDto {
  saveCode: string;
  currentScene: Scene;
  inventory: InventoryItem[];
  worldFlags: Record<string, string>;
  visibleSceneItemCodes: string[];
}
