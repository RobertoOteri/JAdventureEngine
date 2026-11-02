import {GameEffect, Precondition} from './action.model';

export interface DialogueChoice {
  id?: number;
  text: string;
  nextNodeCode: string | null;
  preconditions: Precondition[];
  effects: GameEffect[];
}
