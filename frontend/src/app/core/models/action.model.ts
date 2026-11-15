import {TextBox} from './textbox.model';

export type ActionType =
  | 'LOOK_AT'
  | 'OPEN'
  | 'PICK_UP'
  | 'MOVE'
  | 'USE'
  | 'TALK_TO'
  | 'USE_WITH';

export type PreconditionType =
  | 'HAS_ITEM'
  | 'DOES_NOT_HAVE_ITEM'
  | 'FLAG_EQUALS'
  | 'INPUT_EQUALS';

export type EffectType =
  | 'CHANGE_SCENE'
  | 'ADD_ITEM'
  | 'REMOVE_ITEM'
  | 'SET_FLAG'
  | 'SHOW_SCENE_ITEM'
  | 'HIDE_SCENE_ITEM'
  | 'END_ADVENTURE'
  | 'START_DIALOGUE'
  | 'END_DIALOGUE'
  | 'APPEND_INPUT';

export interface Precondition {
  id?: number;
  type: PreconditionType;
  requiredKey: string;
  expectedValue?: string;
  failureMessage?: string;
  textBox?: TextBox;
}

export interface GameEffect {
  id?: number;
  type: EffectType;
  targetValue?: string;
  flagValue?: string;
}

export interface Action {
  id?: number;
  code?: string;
  type: ActionType;
  targetItemCode?: string;
  successMessage?: string;
  defaultFailureMessage?: string;
  preconditions?: Precondition[];
  effects?: GameEffect[];
}
