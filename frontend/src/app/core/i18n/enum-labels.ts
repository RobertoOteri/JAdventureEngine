import { EffectType, PreconditionType } from '../models';
import { TranslationKey } from './i18n.types';

export const EFFECT_TYPE_KEYS: Record<EffectType, TranslationKey> = {
  CHANGE_SCENE: 'enums.effectType.CHANGE_SCENE',
  ADD_ITEM: 'enums.effectType.ADD_ITEM',
  REMOVE_ITEM: 'enums.effectType.REMOVE_ITEM',
  SET_FLAG: 'enums.effectType.SET_FLAG',
  SHOW_SCENE_ITEM: 'enums.effectType.SHOW_SCENE_ITEM',
  HIDE_SCENE_ITEM: 'enums.effectType.HIDE_SCENE_ITEM',
  END_ADVENTURE: 'enums.effectType.END_ADVENTURE',
  START_DIALOGUE: 'enums.effectType.START_DIALOGUE',
  END_DIALOGUE: 'enums.effectType.END_DIALOGUE'
};

export const PRECONDITION_TYPE_KEYS: Record<PreconditionType, TranslationKey> = {
  HAS_ITEM: 'enums.preconditionType.HAS_ITEM',
  DOES_NOT_HAVE_ITEM: 'enums.preconditionType.DOES_NOT_HAVE_ITEM',
  FLAG_EQUALS: 'enums.preconditionType.FLAG_EQUALS',
  INPUT_EQUALS: 'enums.preconditionType.INPUT_EQUALS'
};
