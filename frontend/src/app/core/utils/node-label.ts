import { DialogueNode } from '../models';

const MAX_LENGTH = 60;

export function nodeLabel(node: DialogueNode): string {
  const text = node.text.trim();
  if (!text) {
    return 'Nodo senza testo';
  }
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text;
}
