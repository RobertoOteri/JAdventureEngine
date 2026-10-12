import { ActionType } from './action.model';
import { GameStateDto } from './game-state.model';

export interface GameActionDto {
  saveCode?: string;
  itemCode: string;
  actionType: ActionType;
}

export interface GameActionResultDto {
  success:boolean;
  feedbackMessage: string;
  state: GameStateDto;
}
