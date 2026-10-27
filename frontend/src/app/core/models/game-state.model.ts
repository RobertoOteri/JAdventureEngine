import { Item } from './item.model';
import { Scene } from './scene.model';

export interface GameStateDto {
  currentScene: Scene;
  inventory: Item[];
  adventureFlags: Record<string, string>;
  visibleItemCodes: string[];
  playTime: number;
  completed?: boolean;
}
