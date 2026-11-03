import { DialogueNode, GameEffect, Item, Precondition } from '../models';

export function collectFlagKeys(items: Item[], nodes: DialogueNode[]): string[] {
  const keys = new Set<string>();

  const fromEffects = (list?: GameEffect[]): void => {
    list?.forEach((e) => {
      if (e.type === 'SET_FLAG' && e.targetValue) keys.add(e.targetValue);
    });
  };

  const fromPreconditions = (list?: Precondition[]): void => {
    list?.forEach((p) => {
      if (p.type === 'FLAG_EQUALS' && p.requiredKey) keys.add(p.requiredKey);
    });
  };

  items.forEach((item) =>
    (item.actions ?? []).forEach((action) => {
      fromEffects(action.effects);
      fromPreconditions(action.preconditions);
    })
  );

  nodes.forEach((node) => {
    fromEffects(node.effects);
    node.choices.forEach((choice) => {
      fromEffects(choice.effects);
      fromPreconditions(choice.preconditions);
    });
  });

  return Array.from(keys).sort();
}
