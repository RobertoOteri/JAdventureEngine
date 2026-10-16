import { GraphicAdventureDto } from './adventure.model';
import {GameStateDto} from './game-state.model';

export interface GameSaveDto {
  id?: number;
  code: string;
  name: string;
  currentSceneCode: string;
  savedAt: string;
  graphicAdventureDto?: GraphicAdventureDto;
  autoSave?: boolean;
  gameState?: GameStateDto;
}
