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
  actionSuccessMsg = '';
  actionFailureMsg = '';
  readonly actionPreconditions = signal<Precondition[]>([]);
  readonly actionEffects = signal<GameEffect[]>([]);

  readonly availableActionTypes: readonly ActionType[] = [
    'LOOK_AT',
    'OPEN',
    'PICK_UP',
    'MOVE',
    'USE',
    'TALK_TO'
  ];

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
    'HIDE_SCENE_ITEM'
  ];

  constructor() {
    effect(() => {
      const existing = this.actionToEdit();
      if (existing) {
        this.actionType = existing.type;
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

  readonly availableSceneOptions = computed(() => {
    return this.store.scenes().map((s) => ({
      code: s.code,
      name: s.name
    }));
  });

  addPrecondition(): void {
    this.actionPreconditions.update((list) => [
      ...list,
      { type: 'HAS_ITEM', requiredKey: '', failureMessage: '' }
    ]);
  }

  removePrecondition(index: number): void {
    this.actionPreconditions.update((list) => list.filter((_, i) => i !== index));
  }

  addEffect(): void {
    this.actionEffects.update((list) => [
      ...list,
      { type: 'CHANGE_SCENE', targetValue: '' }
    ]);
  }

  removeEffect(index: number): void {
    this.actionEffects.update((list) => list.filter((_, i) => i !== index));
  }

  onSubmit(): void {
    const existing = this.actionToEdit();
    const actionPayload: Action = {
      ...(existing?.id ? { id: existing.id } : {}),
      type: this.actionType,
      successMessage: this.actionSuccessMsg.trim() || undefined,
      defaultFailureMessage: this.actionFailureMsg.trim() || undefined,
      preconditions: this.actionPreconditions()
        .filter((p) => p.requiredKey && p.requiredKey.trim().length > 0)
        .map((p) => ({
          type: p.type,
          requiredKey: p.requiredKey.trim(),
          expectedValue: p.expectedValue?.trim() || undefined,
          failureMessage: p.failureMessage?.trim() || undefined
        })),
      effects: this.actionEffects()
        .filter((e) => e.targetValue && e.targetValue.trim().length > 0)
        .map((e) => ({
          type: e.type,
          targetValue: e.targetValue!.trim()
        }))
    };

    this.saveRequested.emit(actionPayload);
  }
}
