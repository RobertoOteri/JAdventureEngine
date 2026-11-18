import { ActionType } from './action.model';
import { GameDialogue, GameViewDto } from './game-state.model';

export interface GameActionDto {
  adventureId: number;
  itemCode: string;
  actionType: ActionType;
  targetItemCode?: string;
  input?: string;
}

export interface GameActionResultDto {
  success: boolean;
  feedbackMessage: string;
  state?: GameViewDto;
  dialogue?: GameDialogue | null;
}

export interface DialogueChoiceRequestDto {
  adventureId: number;
  choiceId: number;
}
