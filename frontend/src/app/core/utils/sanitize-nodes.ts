import { DialogueNode, EffectType, GameEffect, Precondition } from '../models';

const NO_TARGET: readonly EffectType[] = ['END_ADVENTURE', 'END_DIALOGUE'];

function sanitizeEffects(effects: GameEffect[] | null | undefined): GameEffect[] {
  return (effects ?? [])
    .filter((e) => NO_TARGET.includes(e.type) || !!e.targetValue?.trim())
    .map((e) => ({
      type: e.type,
      targetValue: NO_TARGET.includes(e.type) ? undefined : e.targetValue?.trim(),
      flagValue: e.type === 'SET_FLAG' ? e.flagValue : undefined
    }));
}

function sanitizePreconditions(preconditions: Precondition[] | null | undefined): Precondition[] {
  return (preconditions ?? [])
    .filter((p) => !!p.requiredKey?.trim())
    .map((p) => ({
      type: p.type,
      requiredKey: p.requiredKey.trim(),
      expectedValue: p.type === 'FLAG_EQUALS' ? p.expectedValue || undefined : undefined
    }));
}

export function sanitizeNodes(nodes: DialogueNode[]): DialogueNode[] {
  return nodes.map((node) => ({
    ...node,
    effects: sanitizeEffects(node.effects),
    choices: node.choices.map((choice) => ({
      ...choice,
      preconditions: sanitizePreconditions(choice.preconditions),
      effects: sanitizeEffects(choice.effects)
    }))
  }));
}
