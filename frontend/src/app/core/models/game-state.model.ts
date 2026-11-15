import { Item } from './item.model';
import { Scene } from './scene.model';

/** Flag in cui il backend accumula quello che il giocatore compone con i tasti (effetto APPEND_INPUT). */
export const TYPED_INPUT_FLAG = 'typed_input';

export interface GameStateDto {
  currentScene: Scene;
  inventory: Item[];
  adventureFlags: Record<string, string>;
  visibleItemCodes: string[];
  playTime: number;
  completed?: boolean;
  currentDialogueNodeCode?: string | null;
}
