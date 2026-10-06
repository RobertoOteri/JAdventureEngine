import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorStore } from './store/editor.store';
import { Action, Item } from '../../core/models';
import { EditorHeaderComponent } from './components/editor-header/editor-header.component';
import { ScenesSidebarComponent } from './components/scenes-sidebar/scenes-sidebar.component';
import { Point2D, SceneCanvasComponent } from './components/scene-canvas/scene-canvas.component';
import { InspectorSidebarComponent } from './components/inspector-sidebar/inspector-sidebar.component';
import { ActionModalComponent } from './components/action-modal/action-modal.component';
import { InventoryItemData, InventoryItemModalComponent } from './components/inventory-item-modal/inventory-item-modal.component';
import { AdventureCreateComponent } from '../adventures/pages/adventure-create/adventure-create.component';
import { environment } from '../../../environments/environment';

const BACKEND_BASE_URL = environment.apiUrl.replace(/\/api\/?$/, '');

@Component({
  selector: 'app-scene-editor',
  standalone: true,
  imports: [
    CommonModule,
    EditorHeaderComponent,
    ScenesSidebarComponent,
    SceneCanvasComponent,
    InspectorSidebarComponent,
    ActionModalComponent,
    InventoryItemModalComponent,
    AdventureCreateComponent
  ],
  templateUrl: './scene-editor.component.html',
  styleUrl: './scene-editor.component.css'
})
export class SceneEditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(EditorStore);

  @ViewChild('canvasRef') canvasRef?: SceneCanvasComponent;

  readonly isEditingOrCreating = signal<boolean>(false);
  readonly editingItemCode = signal<string | null>(null);

  readonly itemName = signal<string>('');
  readonly itemCode = signal<string>('');
  readonly isCollectible = signal<boolean>(false);
  readonly isInitiallyVisible = signal<boolean>(true);

  readonly sceneImageFile = signal<File | null>(null);
  readonly previewSpriteUrl = signal<string | null>(null);

  readonly spritePosX = signal<number>(350);
  readonly spritePosY = signal<number>(350);
  readonly spriteWidth = signal<number>(200);
  readonly spriteHeight = signal<number>(200);

  readonly isInventoryModalOpen = signal<boolean>(false);
  readonly editingInventoryItemCode = signal<string | null>(null);
  readonly invItemName = signal<string>('');
  readonly invItemDesc = signal<string>('');
  readonly invUseSceneImage = signal<boolean>(true);
  readonly invCustomFile = signal<File | null>(null);
  readonly isActionModalOpen = signal<boolean>(false);
  readonly isAdventureModalOpen = signal<boolean>(false);

  private activePreviewBlobUrl: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const adventureCode = params.get('adventureCode') || '';
      const sceneCode = params.get('sceneCode') || undefined;

      this.cancelDraft();

      if (adventureCode) {
        this.store.loadAdventureAndScenes({ adventureCode, sceneCode });
      }
    });
  }

  ngOnDestroy(): void {
    this.revokeCurrentBlob();
  }

  private revokeCurrentBlob(): void {
    if (this.activePreviewBlobUrl) {
      URL.revokeObjectURL(this.activePreviewBlobUrl);
      this.activePreviewBlobUrl = null;
    }
  }

  private resolveImageUrl(url?: string | null): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${BACKEND_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  startNewHotspot(): void {
    this.cancelDraft();
    this.isEditingOrCreating.set(true);
    this.editingItemCode.set(null);
    this.canvasRef?.clearDraftPoints();
    this.canvasRef?.setTool('HOTSPOT');
  }

  editExistingItem(item: Item): void {
    this.store.selectItem(item);
    this.isEditingOrCreating.set(true);
    this.editingItemCode.set(item.code);

    this.itemName.set(item.name);
    this.itemCode.set(item.code);
    this.spritePosX.set(item.posX ?? 350);
    this.spritePosY.set(item.posY ?? 350);
    this.spriteWidth.set(item.width && item.width > 0 ? item.width : 200);
    this.spriteHeight.set(item.height && item.height > 0 ? item.height : 200);

    const hasInv = !!item.linkedInventoryItem;
    this.isCollectible.set(hasInv);
    if (hasInv && item.linkedInventoryItem) {
      this.invItemName.set(item.linkedInventoryItem.name || item.name);
      this.invItemDesc.set(item.linkedInventoryItem.description || '');
      this.invUseSceneImage.set(!item.linkedInventoryItem.imageUrl || item.linkedInventoryItem.imageUrl === item.imageUrl);
    }

    this.isInitiallyVisible.set(item.initiallyVisible !== undefined ? Boolean(item.initiallyVisible) : true);

    this.revokeCurrentBlob();
    if (item.imageUrl) {
      this.previewSpriteUrl.set(this.resolveImageUrl(item.imageUrl));
      this.canvasRef?.setTool('MOVE');
    } else {
      this.previewSpriteUrl.set(null);
      this.canvasRef?.setTool('HOTSPOT');
    }

    this.canvasRef?.clearDraftPoints();
    if (item.points && item.points.trim().length > 0) {
      const parsedPoints: Point2D[] = item.points
        .trim()
        .split(/\s+/)
        .map((pair) => {
          const [x, y] = pair.split(',').map(Number);
          return { x, y };
        })
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));

      this.canvasRef?.setDraftPoints(parsedPoints);
    }
  }

  cancelDraft(): void {
    this.revokeCurrentBlob();
    this.isEditingOrCreating.set(false);
    this.editingItemCode.set(null);
    this.itemName.set('');
    this.itemCode.set('');
    this.isCollectible.set(false);
    this.isInitiallyVisible.set(true);
    this.sceneImageFile.set(null);
    this.previewSpriteUrl.set(null);

    this.editingInventoryItemCode.set(null);
    this.invItemName.set('');
    this.invItemDesc.set('');
    this.invUseSceneImage.set(true);
    this.invCustomFile.set(null);
    this.isInventoryModalOpen.set(false);

    this.canvasRef?.clearDraftPoints();
    this.canvasRef?.setTool('SELECT');
  }

  onNameChange(val: string): void {
    this.itemName.set(val);
    if (!this.editingItemCode()) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_');
      this.itemCode.set(slug);

      if (!this.invItemName()) {
        this.invItemName.set(val);
      }
    }
  }

  openInventoryModal(): void {
    this.editingInventoryItemCode.set(null);
    if (!this.invItemName()) {
      this.invItemName.set(this.itemName() || 'Nuovo Oggetto');
    }
    this.isInventoryModalOpen.set(true);
  }

  onEditInventoryItem(item: Item): void {
    if (!item.linkedInventoryItem) return;

    this.editingInventoryItemCode.set(item.code);
    this.invItemName.set(item.linkedInventoryItem.name);
    this.invItemDesc.set(item.linkedInventoryItem.description || '');
    this.invUseSceneImage.set(!item.linkedInventoryItem.imageUrl || item.linkedInventoryItem.imageUrl === item.imageUrl);
    this.invCustomFile.set(null);
    this.isInventoryModalOpen.set(true);
  }

  onInventoryConfirmed(data: InventoryItemData): void {
    const invCode = this.editingInventoryItemCode();

    if (invCode) {
      const invPayload = {
        code: invCode,
        name: data.name,
        description: data.description
      };

      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(invPayload)], { type: 'application/json' }));

      if (!data.useSceneImage && data.customFile) {
        formData.append('image', data.customFile);
      }

      this.store.updateInventoryItem(invCode, formData).subscribe({
        next: () => {
          this.isInventoryModalOpen.set(false);
          this.editingInventoryItemCode.set(null);
        },
        error: (err: any) => console.error(err?.error?.message || "Errore aggiornamento inventario.")
      });
      return;
    }

    this.invItemName.set(data.name);
    this.invItemDesc.set(data.description);
    this.invUseSceneImage.set(data.useSceneImage);
    this.invCustomFile.set(data.customFile);
    this.isInventoryModalOpen.set(false);
  }

  onInventoryCancelled(): void {
    this.isInventoryModalOpen.set(false);
    this.editingInventoryItemCode.set(null);
    if (!this.invItemName()) {
      this.isCollectible.set(false);
    }
  }

  onDeleteInventoryItem(itemCode: string): void {
    if (!confirm(`Vuoi rimuovere l'oggetto dall'inventario per #${itemCode}? L'hotspot nella stanza non verrà eliminato.`)) {
      return;
    }

    this.store.deleteInventoryItem(itemCode).subscribe({
      next: () => {
        if (this.editingItemCode() === itemCode) {
          this.isCollectible.set(false);
        }
      },
      error: (err: any) => console.error(err?.error?.message || "Errore rimozione inventario.")
    });
  }

  saveDraft(): void {
    const name = this.itemName().trim();
    const code = this.itemCode().trim();

    if (!name || !code) return;

    let points = this.canvasRef?.draftPolygonPoints() || '';
    const selected = this.store.selectedItem();

    if (!points && this.editingItemCode() && selected?.points) {
      points = selected.points;
    }

    if (!points && (this.sceneImageFile() || this.previewSpriteUrl())) {
      const x = Math.round(this.spritePosX());
      const y = Math.round(this.spritePosY());
      const w = Math.round(this.spriteWidth());
      const h = Math.round(this.spriteHeight());
      points = `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
    }

    if (!points || points.split(/\s+/).length < 3) return;

    const itemPayload: any = {
      name,
      code,
      points,
      posX: Math.round(this.spritePosX()),
      posY: Math.round(this.spritePosY()),
      width: Math.round(this.spriteWidth()),
      height: Math.round(this.spriteHeight()),
      initiallyVisible: this.isInitiallyVisible()
    };

    if (this.isCollectible()) {
      itemPayload.linkedInventoryItem = {
        code: code,
        name: this.invItemName() || name,
        description: this.invItemDesc() || ''
      };
    } else {
      itemPayload.linkedInventoryItem = null;
    }

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(itemPayload)], { type: 'application/json' })
    );

    const sceneFile = this.sceneImageFile();
    const invCustomFile = this.invCustomFile();

    if (!this.invUseSceneImage() && invCustomFile) {
      formData.append('image', invCustomFile);
    } else if (sceneFile) {
      formData.append('image', sceneFile);
    }

    const isEdit = !!this.editingItemCode();
    const save$ = isEdit
      ? this.store.updateItem(this.editingItemCode()!, formData)
      : this.store.saveItem(formData);

    save$.subscribe({
      next: () => this.cancelDraft(),
      error: (err: any) => console.error(err?.error?.message || 'Errore salvataggio.')
    });
  }

  deleteItem(itemCode: string): void {
    if (confirm(`Sei sicuro di voler eliminare l'hotspot #${itemCode}?`)) {
      this.store.deleteItem(itemCode).subscribe({
        next: () => {
          if (this.editingItemCode() === itemCode) {
            this.cancelDraft();
          }
        },
        error: (err: any) => console.error(err?.error?.message || "Errore eliminazione.")
      });
    }
  }

  onTransformChange(t: { posX: number; posY: number; width: number; height: number }): void {
    this.spritePosX.set(t.posX);
    this.spritePosY.set(t.posY);
    this.spriteWidth.set(t.width);
    this.spriteHeight.set(t.height);
  }

  onFileDropped(drop: { file: File; x: number; y: number }): void {
    this.cancelDraft();
    this.isEditingOrCreating.set(true);
    this.editingItemCode.set(null);

    const size = 200;
    this.spritePosX.set(Math.max(0, Math.min(1000 - size, drop.x - size / 2)));
    this.spritePosY.set(Math.max(0, Math.min(1000 - size, drop.y - size / 2)));
    this.spriteWidth.set(size);
    this.spriteHeight.set(size);

    this.sceneImageFile.set(drop.file);
    this.revokeCurrentBlob();
    this.activePreviewBlobUrl = URL.createObjectURL(drop.file);
    this.previewSpriteUrl.set(this.activePreviewBlobUrl);

    const rawName = drop.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const autoName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    this.onNameChange(autoName);

    this.canvasRef?.setTool('MOVE');
  }

  onSceneFileSelected(file: File): void {
    this.sceneImageFile.set(file);
    this.revokeCurrentBlob();
    this.activePreviewBlobUrl = URL.createObjectURL(file);
    this.previewSpriteUrl.set(this.activePreviewBlobUrl);
    this.canvasRef?.setTool('MOVE');
  }

  openActionModal(): void {
    this.isActionModalOpen.set(true);
  }

  closeActionModal(): void {
    this.isActionModalOpen.set(false);
  }

  onSaveAction(action: Action): void {
    const current = this.store.selectedItem();
    if (!current) return;

    this.store.addAction(current.code, action).subscribe({
      next: () => this.closeActionModal(),
      error: (err: any) => console.error(err?.error?.message || "Errore azione.")
    });
  }

  onDeleteAction(actionCode: string): void {
    const current = this.store.selectedItem();
    if (!current || !actionCode) return;

    if (confirm("Vuoi rimuovere questa azione dall'hotspot?")) {
      this.store.deleteAction(current.code, actionCode).subscribe({
        error: (err: any) => console.error('Errore eliminazione azione:', err)
      });
    }
  }

  goToAddScene(): void {
    const advCode = this.store.adventure()?.code;
    if (advCode) {
      this.router.navigate(['/adventures', advCode, 'scenes', 'new']);
    }
  }

  openAdventureModal(): void {
    this.isAdventureModalOpen.set(true);
  }

  onSaveAdventureDetails(formData: FormData): void {
    this.store.updateAdventureDetails(formData).subscribe({
      next: () => {
        this.isAdventureModalOpen.set(false);
      },
      error: (err: any) => console.error(err?.error?.message || "Errore modifica avventura.")
    });
  }
}
