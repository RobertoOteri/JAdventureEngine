import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogueNode, EffectType, GameEffect } from '../../../../core/models';
import { EditorStore } from '../../../scene-editor/store/editor.store';
import { collectFlagKeys } from '../../../../core/utils/flag-keys';
import { nodeLabel } from '../../../../core/utils/node-label';

const ALL_EFFECT_TYPES: readonly EffectType[] = [
  'CHANGE_SCENE',
  'ADD_ITEM',
  'REMOVE_ITEM',
  'SET_FLAG',
  'SHOW_SCENE_ITEM',
  'HIDE_SCENE_ITEM',
  'START_DIALOGUE',
  'END_DIALOGUE',
  'END_ADVENTURE'
];

const DIALOGUE_ONLY_TYPES: readonly EffectType[] = ['END_DIALOGUE'];

let nextListId = 0;

@Component({
  selector: 'app-effects-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './effects-editor.component.html',
  styleUrl: './effects-editor.component.css'
})
export class EffectsEditorComponent {
  private readonly store = inject(EditorStore);

  readonly effects = input<GameEffect[]>([]);
  readonly dialogueNodes = input<DialogueNode[]>([]);
  readonly excludedTypes = input<readonly EffectType[]>([]);
  readonly hiddenTypes = input<readonly EffectType[]>([]);
  readonly dialogueMode = input<boolean>(false);
  readonly emptyHint = input<string>('Nessun effetto impostato.');

  readonly effectsChange = output<GameEffect[]>();

  readonly nodeLabel = nodeLabel;
  readonly flagListId = `effect-flag-keys-${nextListId++}`;

  readonly availableTypes = computed(() =>
    ALL_EFFECT_TYPES.filter(
      (type) =>
        !this.excludedTypes().includes(type) &&
        (this.dialogueMode() || !DIALOGUE_ONLY_TYPES.includes(type))
    )
  );

  readonly visibleEffects = computed(() =>
    this.effects()
      .map((effect, index) => ({ effect, index }))
      .filter(({ effect }) => !this.hiddenTypes().includes(effect.type))
  );

  readonly itemOptions = computed(() =>
    this.store.combinedSceneList().map((item) => ({ code: item.code, name: item.name }))
  );

  readonly hotspotItemOptions = computed(() =>
    this.store
      .combinedSceneList()
      .filter((item) => !!item.hotspot)
      .map((item) => ({ code: item.code, name: item.name }))
  );

  readonly sceneOptions = computed(() =>
    this.store.scenes().map((scene) => ({ code: scene.code, name: scene.name }))
  );

  readonly flagKeys = computed(() =>
    collectFlagKeys(this.store.combinedSceneList(), this.dialogueNodes())
  );

  add(): void {
    const type = this.availableTypes()[0] ?? 'CHANGE_SCENE';
    this.effectsChange.emit([...this.effects(), { type, targetValue: '', flagValue: '' }]);
  }

  remove(index: number): void {
    this.effectsChange.emit(this.effects().filter((_, i) => i !== index));
  }

  patch(index: number, patch: Partial<GameEffect>): void {
    this.effectsChange.emit(
      this.effects().map((effect, i) => (i === index ? { ...effect, ...patch } : effect))
    );
  }

  changeType(index: number, type: EffectType): void {
    this.patch(index, { type, targetValue: '', flagValue: '' });
  }
}
