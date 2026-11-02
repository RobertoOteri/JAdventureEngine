import {GameEffect} from './action.model';
import {DialogueChoice} from './dialogue-choice.model';

export interface DialogueNode {
  code: string;
  text: string;
  choices: DialogueChoice[];
  effects: GameEffect[];
}
