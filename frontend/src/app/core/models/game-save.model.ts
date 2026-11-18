import { GraphicAdventureDto } from './adventure.model';
import {GameViewDto} from './game-state.model';

export interface GameSaveDto {
  id?: number;
  code: string;
  name: string;
  adventureId?: number;
  savedAt: string;
  graphicAdventureDto?: GraphicAdventureDto;
  autoSave?: boolean;
  gameState?: GameViewDto;
}
