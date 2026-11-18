import { ActionType } from './action.model';
import { Hotspot } from './hotspot.model';
import { TextBox } from './textbox.model';

export interface GameItemAction {
  type: ActionType;
  inputBox?: TextBox | null;
}

export interface GameItem {
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  hotspot?: Hotspot | null;
  actions: GameItemAction[];
}

export interface GameScene {
  code: string;
  name?: string;
  backgroundImageUrl?: string;
  keypadBox?: TextBox | null;
  items: GameItem[];
}

export interface GameDialogueChoice {
  id: number;
  text: string;
}

export interface GameDialogue {
  code: string;
  text: string;
  choices: GameDialogueChoice[];
}

export interface GameViewDto {
  currentScene: GameScene;
  inventory: GameItem[];
  typedInput?: string | null;
  playTime: number;
  completed?: boolean;
}
