import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../store/editor.store';
import {
  Action,
  ActionType,
  EffectType,
  GameEffect,
  Precondition,
  PreconditionType
} from '../../../../core/models';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-modal.component.html',
  styleUrl: './action-modal.component.css'
})
export class ActionModalComponent {
  readonly store = inject(EditorStore);

  readonly itemCode = input.required<string>();
  readonly isInventoryContext = input<boolean>(false);
  readonly actionToEdit = input<Action | null>(null);

  readonly saveRequested = output<Action>();
  readonly closeRequested = output<void>();

  actionType: ActionType = 'LOOK_AT';
  withInventoryItemCode = '';
  actionSuccessMsg = '';
  actionFailureMsg = '';
  readonly actionPreconditions = signal<Precondition[]>([]);
  readonly actionEffects = signal<GameEffect[]>([]);

  readonly availableActionTypes = computed<readonly ActionType[]>(() => {
    if (this.isInventoryContext()) {
      return ['LOOK_AT', 'USE', 'USE_WITH'];
    }
    return ['LOOK_AT', 'OPEN', 'PICK_UP', 'MOVE', 'USE', 'TALK_TO', 'USE_WITH'];
  });

  readonly preconditionTypes: readonly PreconditionType[] = [
    'HAS_ITEM',
    'DOES_NOT_HAVE_ITEM',
    'FLAG_EQUALS'
  ];

  readonly effectTypes: readonly EffectType[] = [
    'CHANGE_SCENE',
    'ADD_ITEM',
    'REMOVE_ITEM',
    'SET_FLAG',
    'SHOW_SCENE_ITEM',
    'HIDE_SCENE_ITEM',
    'END_ADVENTURE'
  ];

  constructor() {
    effect(() => {
      const existing = this.actionToEdit();
      if (existing) {
        this.actionType = existing.type;
        this.withInventoryItemCode = existing.withInventoryItemCode || '';
        this.actionSuccessMsg = existing.successMessage || '';
        this.actionFailureMsg = existing.defaultFailureMessage || '';
        this.actionPreconditions.set(
          existing.preconditions ? structuredClone(existing.preconditions) : []
        );
        this.actionEffects.set(
          existing.effects ? structuredClone(existing.effects) : []
        );
      } else {
        this.actionType = 'LOOK_AT';
        this.withInventoryItemCode = '';
        this.actionSuccessMsg = '';
        this.actionFailureMsg = '';
        this.actionPreconditions.set([]);
        this.actionEffects.set([]);
      }
    });
  }

  readonly availableItemOptions = computed(() => {
    const scenes = this.store.scenes();
    const currentScene = this.store.currentScene();
    const itemMap = new Map<string, string>();

    for (const scene of scenes) {
      for (const it of scene.items || []) {
        if (!itemMap.has(it.code)) {
          itemMap.set(it.code, it.name);
        }
      }
    }

    if (currentScene?.items) {
      for (const it of currentScene.items) {
        if (!itemMap.has(it.code)) {
          itemMap.set(it.code, it.name);
        }
      }
    }

    return Array.from(itemMap.entries()).map(([code, name]) => ({ code, name }));
  });

  readonly availableInventoryItems = computed(() => {
    const invMap = new Map<string, string>();

    for (const inv of this.store.inventoryItems()) {
      if (inv.code) {
        invMap.set(inv.code, inv.name || inv.code);
      }
    }

    for (const scene of this.store.scenes()) {
      for (const it of scene.items || []) {
        if (it.linkedInventoryItem?.code) {
          invMap.set(it.linkedInventoryItem.code, it.linkedInventoryItem.name || it.name);
        }
      }
    }

    return Array.from(invMap.entries()).map(([code, name]) => ({ code, name }));
  });

  readonly availableUseWithOptions = computed(() => {
    const currentCode = this.itemCode();

    const sceneTargets = this.availableItemOptions().filter(
      (it) => it.code !== currentCode
    );

    const inventoryTargets = this.availableInventoryItems().filter(
      (inv) => inv.code !== currentCode
    );

    return {
      sceneItems: sceneTargets,
      inventoryItems: inventoryTargets
    };
  });

  readonly availableSceneOptions = computed(() => {
    return this.store.scenes().map((s) => ({
      code: s.code,
      name: s.name
    }));
  });

  readonly availableFlagKeys = computed(() => {
    const keys = new Set<string>();
    const scenes = this.store.scenes();
    for (const scene of scenes) {
      for (const it of scene.items || []) {
        const allActions = [...(it.actions || []), ...(it.linkedInventoryItem?.actions || [])];
        for (const act of allActions) {
          for (const eff of act.effects || []) {
            if (eff.type === 'SET_FLAG' && eff.targetValue) {
              keys.add(eff.targetValue);
            }
          }
          for (const prec of act.preconditions || []) {
            if (prec.type === 'FLAG_EQUALS' && prec.requiredKey) {
              keys.add(prec.requiredKey);
            }
          }
        }
      }
    }
    return Array.from(keys);
  });

  addPrecondition(): void {
    this.actionPreconditions.update((list) => [
      ...list,
      { type: 'HAS_ITEM', requiredKey: '', expectedValue: '', failureMessage: '' }
    ]);
  }

  removePrecondition(index: number): void {
    this.actionPreconditions.update((list) => list.filter((_, i) => i !== index));
  }

  addEffect(): void {
    this.actionEffects.update((list) => [
      ...list,
      { type: 'CHANGE_SCENE', targetValue: '', flagValue: '' }
    ]);
  }

  removeEffect(index: number): void {
    this.actionEffects.update((list) => list.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    if (this.actionType === 'USE_WITH' && !this.withInventoryItemCode) {
      alert("Seleziona l'elemento bersaglio con cui interagire.");
      return;
    }

    const existing = this.actionToEdit();
    const actionPayload: Action = {
      ...(existing?.id ? { id: existing.id } : {}),
      type: this.actionType,
      withInventoryItemCode: this.actionType === 'USE_WITH' ? this.withInventoryItemCode : undefined,
      successMessage: this.actionSuccessMsg || undefined,
      defaultFailureMessage: this.actionFailureMsg || undefined,
      preconditions: this.actionPreconditions()
        .filter((p) => p.requiredKey && p.requiredKey.length > 0)
        .map((p) => ({
          type: p.type,
          requiredKey: p.requiredKey,
          expectedValue: p.type === 'FLAG_EQUALS' ? (p.expectedValue || undefined) : undefined,
          failureMessage: p.failureMessage || undefined
        })),
      effects: this.actionEffects()
        .filter((e) => e.type === 'END_ADVENTURE' || (e.type === 'SET_FLAG' ? !!e.targetValue : !!e.targetValue))
        .map((e) => ({
          type: e.type,
          targetValue: e.type === 'END_ADVENTURE' ? undefined : e.targetValue,
          flagValue: e.type === 'SET_FLAG' ? e.flagValue : undefined
        }))
    };

    this.saveRequested.emit(actionPayload);
  }
}
