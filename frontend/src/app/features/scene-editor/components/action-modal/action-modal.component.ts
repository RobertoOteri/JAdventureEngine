import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorStore } from '../../store/editor.store';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationKey } from '../../../../core/i18n/i18n.types';
import { TextBoxPlacerComponent } from '../textbox-placer/textbox-placer.component';
import { TEXTBOX_GRID, TextBox, normalizeTextBox } from '../../../../core/models/textbox.model';
import { ACTION_TYPE_KEYS, EFFECT_TYPE_KEYS, PRECONDITION_TYPE_KEYS } from '../../../../core/i18n/enum-labels';
import {
  Action,
  ActionType,
  EffectType,
  GameEffect,
  Precondition,
  PreconditionType,
  DialogueNode
} from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { nodeLabel } from '../../../../core/utils/node-label';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  imports: [FormsModule, TextBoxPlacerComponent, TranslatePipe],
  templateUrl: './action-modal.component.html',
  styleUrl: './action-modal.component.css'
})
export class ActionModalComponent {

  private readonly i18n = inject(TranslationService);
  private readonly notifications = inject(NotificationService);

  readonly store = inject(EditorStore);

  readonly itemCode = input.required<string>();
  readonly actionToEdit = input<Action | null>(null);

  readonly saveRequested = output<Action>();
  readonly closeRequested = output<void>();

  actionType: ActionType = 'LOOK_AT';
  targetItemCode = '';
  actionSuccessMsg = '';
  readonly actionPreconditions = signal<Precondition[]>([]);
  readonly actionEffects = signal<GameEffect[]>([]);

  readonly dialogueNodes = signal<DialogueNode[]>([]);
  readonly nodeLabel = (node: DialogueNode) => nodeLabel(node, this.i18n);

  readonly actionTypeKeys = ACTION_TYPE_KEYS;
  readonly preconditionTypeKeys = PRECONDITION_TYPE_KEYS;
  readonly effectTypeKeys = EFFECT_TYPE_KEYS;

  readonly currentItemId = computed(
    () => this.store.combinedSceneList().find((i) => i.code === this.itemCode())?.id ?? null
  );

  readonly backgroundUrl = this.store.backgroundUrl;

  readonly fonts: readonly string[] = [
    'Arial',
    'Courier New',
    'monospace',
    'Georgia',
    'Verdana',
    'Trebuchet MS'
  ];

  readonly textColors: readonly { labelKey: TranslationKey; value: string }[] = [
    { labelKey: 'actionModal.colors.white', value: '#ffffff' },
    { labelKey: 'actionModal.colors.black', value: '#000000' },
    { labelKey: 'actionModal.colors.yellow', value: '#facc15' },
    { labelKey: 'actionModal.colors.red', value: '#ef4444' },
    { labelKey: 'actionModal.colors.green', value: '#22c55e' },
    { labelKey: 'actionModal.colors.blue', value: '#38bdf8' },
    { labelKey: 'actionModal.colors.orange', value: '#f97316' }
  ];

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

    const otherActions = existingActions.filter(a => {
      if (!editingAction) return true;
      if (a.id && editingAction.id) return a.id !== editingAction.id;
      return a.type !== editingAction.type;
    });

    const usedTypes = new Set(otherActions.map(a => a.type).filter(type => type !== 'USE_WITH'));

    return allTypes.filter(type => type === 'USE_WITH' || !usedTypes.has(type) || (editingAction && type === editingAction.type));
  });

  readonly preconditionTypes: readonly PreconditionType[] = [
    'HAS_ITEM',
    'DOES_NOT_HAVE_ITEM',
    'FLAG_EQUALS',
    'INPUT_EQUALS'
  ];

  readonly effectTypes: readonly EffectType[] = [
    'CHANGE_SCENE',
    'ADD_ITEM',
    'REMOVE_ITEM',
    'SET_FLAG',
    'SHOW_SCENE_ITEM',
    'HIDE_SCENE_ITEM',
    'END_ADVENTURE',
    'START_DIALOGUE',
    'APPEND_INPUT',
    'CLEAR_INPUT'
  ];

  constructor() {
    effect(() => {
      const existing = this.actionToEdit();
      if (existing) {
        this.actionType = existing.type;
        this.targetItemCode = existing.targetItemCode || '';
        this.actionSuccessMsg = existing.successMessage || '';

        const clonedPreconditions = existing.preconditions ? structuredClone(existing.preconditions) : [];
        const processedPreconditions = clonedPreconditions.map((p: Precondition) => ({
          ...p,
          textBox: normalizeTextBox(p.textBox)
        }));

        this.actionPreconditions.set(processedPreconditions);
        this.actionEffects.set(
          existing.effects ? structuredClone(existing.effects) : []
        );
      } else {
        this.actionType = 'LOOK_AT';
        this.targetItemCode = '';
        this.actionSuccessMsg = '';
        this.actionPreconditions.set([]);
        this.actionEffects.set([]);
      }
    });

    effect((onCleanup) => {
      const itemId = this.currentItemId();
      this.dialogueNodes.set([]);
      if (!itemId) {
        return;
      }

      const sub = this.store.loadDialogueNodes(itemId).subscribe({
        next: (nodes) => this.dialogueNodes.set(nodes),
        error: () => this.dialogueNodes.set([])
      });
      onCleanup(() => sub.unsubscribe());
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

  /** Oggetti a cui un tasto può aggiungere caratteri: solo quelli con un'azione che ha un INPUT_EQUALS. */
  readonly inputTargetItems = computed(() => {
    const scenes = this.store.scenes();
    const currentScene = this.store.currentScene();
    const allScenes = scenes.length > 0 ? scenes : (currentScene ? [currentScene] : []);
    const map = new Map<string, string>();

    for (const scene of allScenes) {
      for (const it of scene.items || []) {
        const hasInput = (it.actions || []).some((act) =>
          (act.preconditions || []).some((p) => p.type === 'INPUT_EQUALS')
        );
        if (hasInput && !map.has(it.code)) {
          map.set(it.code, it.name);
        }
      }
    }
    return Array.from(map, ([code, name]) => ({ code, name }));
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
      {
        type: 'HAS_ITEM',
        requiredKey: '',
        expectedValue: '',
        failureMessage: '',
        textBox: normalizeTextBox()
      }
    ]);
  }

  removePrecondition(index: number): void {
    this.closeColorMenu();
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

  onEffectTypeChange(eff: GameEffect, type: EffectType): void {
    eff.type = type;
    eff.targetValue = '';
    eff.flagValue = '';
  }

  patchBox(prec: Precondition, patch: Partial<TextBox>): void {
    prec.textBox = { ...normalizeTextBox(prec.textBox), ...patch };
  }

  stepFont(prec: Precondition, delta: number): void {
    const current = normalizeTextBox(prec.textBox).fontSize;
    this.patchBox(prec, { fontSize: Math.max(10, Math.min(72, current + delta)) });
  }

  centerBox(prec: Precondition): void {
    const box = normalizeTextBox(prec.textBox);
    this.patchBox(prec, {
      posX: Math.round((TEXTBOX_GRID - box.width) / 2),
      posY: Math.round((TEXTBOX_GRID - box.height) / 2)
    });
  }

  readonly openColorMenu = signal<number | null>(null);

  toggleColorMenu(index: number): void {
    this.openColorMenu.update((current) => (current === index ? null : index));
  }

  closeColorMenu(): void {
    this.openColorMenu.set(null);
  }

  pickColor(prec: Precondition, color: string): void {
    this.patchBox(prec, { color });
    this.closeColorMenu();
  }

  colorLabel(value?: string): TranslationKey {
    const current = value ?? '#ffffff';
    return this.textColors.find((c) => c.value === current)?.labelKey ?? 'actionModal.colors.custom';
  }

  onSubmit(): void {
    if (this.actionType === 'USE_WITH' && !this.targetItemCode) {
      this.notifications.warning(this.i18n.t('actionModal.targetRequired'));
      return;
    }

    const existing = this.actionToEdit();
    const actionPayload: Action = {
      ...(existing?.id ? { id: existing.id } : {}),
      type: this.actionType,
      targetItemCode: this.actionType === 'USE_WITH' ? this.targetItemCode : undefined,
      successMessage: this.actionSuccessMsg || undefined,
      defaultFailureMessage: undefined,
      preconditions: this.actionPreconditions()
        .filter((p) => p.requiredKey || p.type === 'INPUT_EQUALS')
        .map((p) => ({
          type: p.type,
          requiredKey: p.type === 'INPUT_EQUALS' ? 'INPUT' : p.requiredKey,
          expectedValue: (p.type === 'FLAG_EQUALS' || p.type === 'INPUT_EQUALS') ? (p.expectedValue || undefined) : undefined,
          failureMessage: p.failureMessage || undefined,
          textBox: p.type === 'INPUT_EQUALS' ? p.textBox : undefined
        })),
      effects: this.actionEffects()
        .filter((e) => e.type === 'END_ADVENTURE' || !!e.targetValue)
        .map((e) => ({
          type: e.type,
          targetValue: e.type === 'END_ADVENTURE' ? undefined : e.targetValue,
          flagValue: e.type === 'SET_FLAG' || e.type === 'APPEND_INPUT' ? e.flagValue : undefined
        }))
    };

    this.saveRequested.emit(actionPayload);
  }
}
