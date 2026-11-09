import { DialogueNode } from '../models';
import { TranslationService } from '../i18n/translation.service';

const MAX_LENGTH = 60;

export function nodeLabel(node: DialogueNode, i18n: TranslationService): string {
  const text = node.text.trim();
  if (!text) {
    return i18n.t('dialogueEditor.untitledNode');
  }
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text;
}
