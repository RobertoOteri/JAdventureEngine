import { ActionType } from './action.model';
import { GameStateDto } from './game-state.model';

export interface GameActionDto {
  itemCode: string;
  actionType: ActionType;
}

export interface GameActionResultDto {
  success:boolean;
  feedbackMessage: string;
  state: GameStateDto;
}
