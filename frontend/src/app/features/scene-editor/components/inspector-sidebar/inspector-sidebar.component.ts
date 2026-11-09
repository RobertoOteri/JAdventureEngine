import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStore } from '../../store/editor.store';
import { Action, Item } from '../../../../core/models';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { ACTION_TYPE_KEYS } from '../../../../core/i18n/enum-labels';

export type ActionKind = 'scene' | 'inventory';

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './inspector-sidebar.component.html',
  styleUrl: './inspector-sidebar.component.css'
})
export class InspectorSidebarComponent {
  readonly store = inject(EditorStore);
  readonly actionTypeKeys = ACTION_TYPE_KEYS;

  readonly dialogueNodeCount = signal<number | null>(null);

  readonly isEditingOrCreating = input<boolean>(false);
  readonly editingItemCode = input<string | null>(null);
  readonly draftPointsCount = input<number>(0);

  readonly itemName = input<string>('');
  readonly itemCode = input<string>('');
  readonly itemDescription = input<string>('');
  readonly isCollectible = input<boolean>(false);
  readonly isInitiallyVisible = input<boolean>(true);
  readonly sceneImageFile = input<File | null>(null);
  readonly previewSpriteUrl = input<string | null>(null);

  readonly startCreateRequested = output<void>();
  readonly editItemRequested = output<Item>();
  readonly cancelDraftRequested = output<void>();
  readonly saveDraftRequested = output<void>();
  readonly deleteItemRequested = output<string>();

  readonly itemNameChange = output<string>();
  readonly itemCodeChange = output<string>();
  readonly itemDescriptionChange = output<string>();
  readonly isCollectibleChange = output<boolean>();
  readonly isInitiallyVisibleChange = output<boolean>();
  readonly sceneImageSelected = output<File>();

  readonly openAddActionRequested = output<void>();
  readonly editActionRequested = output<Action>();
  readonly deleteActionRequested = output<number>();

  readonly openDialoguesRequested = output<Item>();

  constructor() {
    effect((onCleanup) => {
      const item = this.store.selectedItem();
      this.dialogueNodeCount.set(null);

      if (!item?.id) {
        return;
      }

      const sub = this.store.loadDialogueNodes(item.id).subscribe({
        next: (nodes) => this.dialogueNodeCount.set(nodes.length),
        error: () => this.dialogueNodeCount.set(null)
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  hasPickUp(item: Item | null | undefined): boolean {
    return (item?.actions ?? []).some((a) => a.type === 'PICK_UP');
  }

  selectItem(item: Item): void {
    this.store.selectItem(item);
  }

  onNameInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.itemNameChange.emit(val);
  }

  onCodeInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.itemCodeChange.emit(val);
  }

  onDescriptionInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.itemDescriptionChange.emit(val);
  }

  onVisibleToggle(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isInitiallyVisibleChange.emit(isChecked);
  }

  onSceneFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.sceneImageSelected.emit(input.files[0]);
    }
  }

  actionIconPath(type: string): string | null {
    if (!type) return null;
    return `/icons/actions/${type.toLowerCase()}.svg`;
  }

  onAddActionClick(): void {
    this.openAddActionRequested.emit();
  }

  onEditAction(action: Action): void {
    this.editActionRequested.emit(action);
  }

  onDeleteAction(event: Event, actionId?: number): void {
    event.stopPropagation();
    if (actionId) {
      this.deleteActionRequested.emit(actionId);
    }
  }
}
