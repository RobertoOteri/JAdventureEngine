import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogueNode, Precondition, PreconditionType } from '../../../../core/models';
import { EditorStore } from '../../../scene-editor/store/editor.store';
import { collectFlagKeys } from '../../../../core/utils/flag-keys';

const DIALOGUE_PRECONDITION_TYPES: readonly PreconditionType[] = [
  'HAS_ITEM',
  'DOES_NOT_HAVE_ITEM',
  'FLAG_EQUALS'
];

let nextListId = 0;

@Component({
  selector: 'app-preconditions-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './preconditions-editor.component.html',
  styleUrl: './preconditions-editor.component.css'
})
export class PreconditionsEditorComponent {
  private readonly store = inject(EditorStore);

  readonly preconditions = input<Precondition[]>([]);
  readonly dialogueNodes = input<DialogueNode[]>([]);
  readonly emptyHint = input<string>('Nessuna precondizione impostata.');


  readonly preconditionsChange = output<Precondition[]>();

  readonly types = DIALOGUE_PRECONDITION_TYPES;
  readonly flagListId = `precondition-flag-keys-${nextListId++}`;

  readonly itemOptions = computed(() =>
    this.store.combinedSceneList().map((item) => ({ code: item.code, name: item.name }))
  );

  readonly flagKeys = computed(() =>
    collectFlagKeys(this.store.combinedSceneList(), this.dialogueNodes())
  );

  add(): void {
    this.preconditionsChange.emit([
      ...this.preconditions(),
      { type: 'HAS_ITEM', requiredKey: '', expectedValue: '' }
    ]);
  }

  remove(index: number): void {
    this.preconditionsChange.emit(this.preconditions().filter((_, i) => i !== index));
  }

  patch(index: number, patch: Partial<Precondition>): void {
    this.preconditionsChange.emit(
      this.preconditions().map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  }

  changeType(index: number, type: PreconditionType): void {
    this.patch(index, { type, requiredKey: '', expectedValue: '' });
  }
}
