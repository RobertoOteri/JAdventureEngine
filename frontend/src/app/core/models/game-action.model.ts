import { ActionType } from './action.model';
import { GameStateDto } from './game-state.model';
import { DialogueNode } from './dialogue-node.model';

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
  state?: GameStateDto;
  dialogue?: DialogueNode | null;
}

export interface DialogueChoiceRequestDto {
  adventureId: number;
  choiceId: number;
}
