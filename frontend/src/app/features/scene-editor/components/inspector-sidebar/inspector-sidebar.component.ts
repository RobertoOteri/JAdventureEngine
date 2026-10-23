import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorStore } from '../../store/editor.store';
import { Action, Item } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';

const BACKEND_BASE_URL = environment.apiUrl.replace(/\/api\/?$/, '');

export type ActionKind = 'scene' | 'inventory';

const ACTION_ICONS: Record<string, string> = {
  LOOK_AT: 'bi-eye',
  PICK_UP: 'bi-hand-index-thumb',
  USE: 'bi-gear',
  OPEN: 'bi-unlock',
  TALK_TO: 'bi-chat-dots',
  MOVE: 'bi-arrows-move',
  USE_WITH: 'bi-link-45deg'
};

@Component({
  selector: 'app-inspector-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inspector-sidebar.component.html',
  styleUrl: './inspector-sidebar.component.css'
})
export class InspectorSidebarComponent {
  readonly store = inject(EditorStore);

  readonly expandedInventoryItemCode = signal<string | null>(null);

  readonly isEditingOrCreating = input<boolean>(false);
  readonly editingItemCode = input<string | null>(null);
  readonly draftPointsCount = input<number>(0);

  readonly itemName = input<string>('');
  readonly itemCode = input<string>('');
  readonly isCollectible = input<boolean>(false);
  readonly isInitiallyVisible = input<boolean>(true);
  readonly sceneImageFile = input<File | null>(null);
  readonly previewSpriteUrl = input<string | null>(null);

  readonly startCreateRequested = output<void>();
  readonly startCreateStandaloneInventoryRequested = output<void>();
  readonly editItemRequested = output<Item>();
  readonly cancelDraftRequested = output<void>();
  readonly saveDraftRequested = output<void>();
  readonly deleteItemRequested = output<string>();

  readonly itemNameChange = output<string>();
  readonly itemCodeChange = output<string>();
  readonly isCollectibleChange = output<boolean>();
  readonly isInitiallyVisibleChange = output<boolean>();
  readonly sceneImageSelected = output<File>();

  readonly openInventoryModalRequested = output<void>();
  readonly editInventoryItemRequested = output<Item>();
  readonly deleteInventoryItemRequested = output<string>();

  readonly openAddActionRequested = output<void>();
  readonly editActionRequested = output<Action>();
  readonly openAddInventoryActionRequested = output<void>();
  readonly editInventoryActionRequested = output<Action>();
  readonly deleteActionRequested = output<number>();

  selectItem(item: Item): void {
    this.store.selectItem(item);
  }

  toggleInventoryDropdown(code: string, event: Event): void {
    event.stopPropagation();
    this.expandedInventoryItemCode.update((curr) => (curr === code ? null : code));
  }

  onNameInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.itemNameChange.emit(val);
  }

  onCodeInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.itemCodeChange.emit(val);
  }

  onCollectibleCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isCollectibleChange.emit(isChecked);
    if (isChecked) {
      this.openInventoryModalRequested.emit();
    }
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

  resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  actionLabel(type: string): string {
    return type;
  }

  actionIcon(type: string): string {
    return ACTION_ICONS[type] ?? 'bi-lightning-charge';
  }

  inventoryItemName(code: string): string {
    const foundGlobal = this.store.inventoryItems().find((i) => i.code === code);
    if (foundGlobal) return foundGlobal.name;

    for (const scene of this.store.scenes()) {
      for (const item of scene.items ?? []) {
        const inv = item.linkedInventoryItem;
        if (inv && (inv.code === code || item.code === code)) {
          return inv.name;
        }
      }
    }
    return `#${code}`;
  }

  onEditAction(action: Action, kind: ActionKind): void {
    if (kind === 'inventory') {
      this.editInventoryActionRequested.emit(action);
    } else {
      this.editActionRequested.emit(action);
    }
  }

  onDeleteAction(event: Event, actionId?: number): void {
    event.stopPropagation();
    if (actionId) {
      this.deleteActionRequested.emit(actionId);
    }
  }
}
