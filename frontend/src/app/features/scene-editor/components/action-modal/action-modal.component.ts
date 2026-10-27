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
  readonly actionToEdit = input<Action | null>(null);

  readonly saveRequested = output<Action>();
  readonly closeRequested = output<void>();

  actionType: ActionType = 'LOOK_AT';
  targetItemCode = '';
  actionSuccessMsg = '';
  actionFailureMsg = '';
  readonly actionPreconditions = signal<Precondition[]>([]);
  readonly actionEffects = signal<GameEffect[]>([]);

  readonly availableActionTypes = computed(() => {
    const allTypes: readonly ActionType[] = [
      'LOOK_AT',
      'OPEN',
      'PICK_UP',
      'MOVE',
      'USE',
      'TALK_TO',
      'USE_WITH'
    ];

    const editingAction = this.actionToEdit();
    const currentItem = this.store.selectedItem() ?? this.store.combinedSceneList().find(i => i.code === this.itemCode());
    const existingActions = currentItem?.actions ?? [];

    const usedTypes = new Set(
      existingActions
        .filter(a => !editingAction || a.id !== editingAction.id)
        .map(a => a.type)
    );

    return allTypes.filter(type => !usedTypes.has(type));
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
        this.targetItemCode = existing.targetItemCode || '';
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
        this.targetItemCode = '';
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
    const adventureItems = this.store.adventureItems();
    const itemMap = new Map<string, string>();

    for (const it of adventureItems || []) {
      if (!itemMap.has(it.code)) {
        itemMap.set(it.code, it.name);
      }
    }

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
    return this.availableItemOptions();
  });

  readonly sceneItemsWithHotspot = computed(() => {
    const scenes = this.store.scenes();
    const currentScene = this.store.currentScene();
    const map = new Map<string, string>();

    const allScenes = scenes.length > 0 ? scenes : (currentScene ? [currentScene] : []);

    for (const scene of allScenes) {
      for (const it of scene.items || []) {
        if (it.hotspot && !map.has(it.code)) {
          map.set(it.code, it.name);
        }
      }
    }

    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  });

  readonly availableUseWithOptions = computed(() => {
    const currentCode = this.itemCode();
    const targets = this.availableItemOptions().filter((it) => it.code !== currentCode);
    return {
      sceneItems: targets,
      inventoryItems: targets
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
        for (const act of it.actions || []) {
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
    if (this.actionType === 'USE_WITH' && !this.targetItemCode) {
      alert("Seleziona l'elemento bersaglio con cui interagire.");
      return;
    }

    const existing = this.actionToEdit();
    const actionPayload: Action = {
      ...(existing?.id ? { id: existing.id } : {}),
      type: this.actionType,
      targetItemCode: this.actionType === 'USE_WITH' ? this.targetItemCode : undefined,
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
        .filter((e) => e.type === 'END_ADVENTURE' || !!e.targetValue)
        .map((e) => ({
          type: e.type,
          targetValue: e.type === 'END_ADVENTURE' ? undefined : e.targetValue,
          flagValue: e.type === 'SET_FLAG' ? e.flagValue : undefined
        }))
    };

    this.saveRequested.emit(actionPayload);
  }
}
