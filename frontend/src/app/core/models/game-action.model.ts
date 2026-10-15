import { ActionType } from './action.model';
import { GameStateDto } from './game-state.model';

export interface GameActionDto {
  saveCode: string;
  actionCode: string;
  actionType: ActionType;
}

export interface GameActionResultDto {
  success: boolean;
  feedbackMessage: string;
  state?: GameStateDto;
}
