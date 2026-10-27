import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStore } from '../../store/editor.store';
import { Action, Item } from '../../../../core/models';

export type ActionKind = 'scene' | 'inventory';

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspector-sidebar.component.html',
  styleUrl: './inspector-sidebar.component.css'
})
export class InspectorSidebarComponent {
  readonly store = inject(EditorStore);

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

  hasPickUp(item: Item | null | undefined): boolean {
    return (item?.actions ?? []).some((a) => a.type === 'PICK_UP');
  }

  vertexCount(item: Item): number {
    const points = item.hotspot?.points?.trim();
    return points ? points.split(/\s+/).length : 0;
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

  onCollectibleCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isCollectibleChange.emit(isChecked);
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

  actionLabel(type: string): string {
    return type;
  }

  actionIconPath(type: string): string | null {
    if (!type || type === 'USE_WITH') return null;
    return `/icons/actions/${type.toLowerCase()}.svg`;
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
