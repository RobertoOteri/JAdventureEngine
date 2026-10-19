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
  readonly editingInventoryItemId = signal<number | null>(null);
  readonly invItemName = signal<string>('');
  readonly invItemDesc = signal<string>('');
  readonly invUseSceneImage = signal<boolean>(true);
  readonly invCustomFile = signal<File | null>(null);
  readonly invCustomPreviewUrl = signal<string | null>(null);

  readonly isActionModalOpen = signal<boolean>(false);
  readonly editingAction = signal<Action | null>(null);

  readonly isAdventureModalOpen = signal<boolean>(false);

  private activePreviewBlobUrl: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const rawAdventure = params.get('adventureCode') || params.get('adventureId') || params.get('id');
      const sceneIdParam = params.get('sceneId');
      const sceneCode = params.get('sceneCode') || undefined;

      this.cancelDraft();

      const numericId = rawAdventure && !isNaN(Number(rawAdventure)) ? Number(rawAdventure) : undefined;
      const stringCode = !numericId && rawAdventure ? rawAdventure : undefined;
      const sceneId = sceneIdParam ? Number(sceneIdParam) : undefined;

      if (numericId || stringCode) {
        this.store.loadAdventureAndScenes({
          adventureId: numericId,
          adventureCode: stringCode,
          sceneId,
          sceneCode
        });
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
    return url ?? '';
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
      this.editingInventoryItemId.set(item.linkedInventoryItem.id ?? null);
      this.invItemName.set(item.linkedInventoryItem.name || item.name);
      this.invItemDesc.set(item.linkedInventoryItem.description || '');

      const hasDedicated = !!item.linkedInventoryItem.imageUrl && item.linkedInventoryItem.imageUrl !== item.imageUrl;
      this.invUseSceneImage.set(!hasDedicated);
      this.invCustomPreviewUrl.set(hasDedicated ? this.resolveImageUrl(item.linkedInventoryItem.imageUrl) : null);
    } else {
      this.invCustomPreviewUrl.set(null);
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

    this.editingInventoryItemId.set(null);
    this.invItemName.set('');
    this.invItemDesc.set('');
    this.invUseSceneImage.set(true);
    this.invCustomFile.set(null);
    this.invCustomPreviewUrl.set(null);
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
    this.editingInventoryItemId.set(null);
    if (!this.invItemName()) {
      this.invItemName.set(this.itemName() || 'Nuovo Oggetto');
    }
    this.invCustomPreviewUrl.set(null);
    this.isInventoryModalOpen.set(true);
  }

  onEditInventoryItem(item: Item): void {
    if (!item.linkedInventoryItem) return;

    this.store.selectItem(item);
    this.itemCode.set(item.code);
    this.editingInventoryItemId.set(item.linkedInventoryItem.id ?? null);
    this.invItemName.set(item.linkedInventoryItem.name);
    this.invItemDesc.set(item.linkedInventoryItem.description || '');

    const hasDedicated = !!item.linkedInventoryItem.imageUrl && item.linkedInventoryItem.imageUrl !== item.imageUrl;
    this.invUseSceneImage.set(!hasDedicated);
    this.invCustomFile.set(null);
    this.invCustomPreviewUrl.set(hasDedicated ? this.resolveImageUrl(item.linkedInventoryItem.imageUrl) : null);

    this.previewSpriteUrl.set(item.imageUrl ? this.resolveImageUrl(item.imageUrl) : null);

    this.isInventoryModalOpen.set(true);
  }

  onInventoryConfirmed(data: InventoryItemData): void {
    const invId = this.editingInventoryItemId();

    if (invId) {
      const currentItem = this.store.selectedItem();
      const invPayload = {
        id: invId,
        code: currentItem?.code,
        name: data.name,
        description: data.description,
        imageUrl: data.useSceneImage ? (currentItem?.imageUrl ?? '') : ''
      };

      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(invPayload)], { type: 'application/json' }));

      if (!data.useSceneImage && data.customFile) {
        formData.append('image', data.customFile);
      }

      this.store.updateInventoryItem(formData).subscribe({
        next: () => {
          this.isInventoryModalOpen.set(false);
          this.editingInventoryItemId.set(null);
        },
        error: (err: any) => console.error(err?.error?.message || 'Errore aggiornamento inventario.')
      });
      return;
    }

    this.invItemName.set(data.name);
    this.invItemDesc.set(data.description);
    this.invUseSceneImage.set(data.useSceneImage);
    this.invCustomFile.set(data.customFile);
    this.isCollectible.set(true);
    this.isInventoryModalOpen.set(false);
  }

  onInventoryCancelled(): void {
    this.isInventoryModalOpen.set(false);
    this.editingInventoryItemId.set(null);
    if (!this.invItemName()) {
      this.isCollectible.set(false);
    }
  }

  onDeleteInventoryItem(itemCode: string): void {
    const currentItem = this.store.currentScene()?.items?.find((i) => i.code === itemCode);
    const invId = currentItem?.linkedInventoryItem?.id;
    if (!invId) return;

    if (!confirm(`Vuoi rimuovere l'oggetto dall'inventario per #${itemCode}? L'hotspot nella stanza non verrà eliminato.`)) {
      return;
    }

    this.store.deleteInventoryItem(invId).subscribe({
      next: () => {
        if (this.editingItemCode() === itemCode) {
          this.isCollectible.set(false);
        }
      },
      error: (err: any) => console.error(err?.error?.message || 'Errore rimozione inventario.')
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

    const isEdit = !!this.editingItemCode();
    const targetItemId = selected?.id;

    if (isEdit && !targetItemId) {
      console.error("Impossibile aggiornare l'oggetto: ID mancante.");
      return;
    }

    const itemPayload: any = {
      ...(isEdit ? { id: targetItemId } : {}),
      name,
      code,
      points,
      posX: Math.round(this.spritePosX()),
      posY: Math.round(this.spritePosY()),
      width: Math.round(this.spriteWidth()),
      height: Math.round(this.spriteHeight()),
      initiallyVisible: this.isInitiallyVisible()
    };

    const sceneFile = this.sceneImageFile();
    const invCustomFile = this.invCustomFile();

    if (this.isCollectible()) {
      itemPayload.linkedInventoryItem = {
        code,
        name: this.invItemName() || name,
        description: this.invItemDesc() || '',
        imageUrl: (!this.invUseSceneImage() && !invCustomFile && this.invCustomPreviewUrl())
          ? this.invCustomPreviewUrl()
          : ''
      };
    } else {
      itemPayload.linkedInventoryItem = null;
    }

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(itemPayload)], { type: 'application/json' })
    );

    if (sceneFile) {
      formData.append('image', sceneFile);
    }

    if (!this.invUseSceneImage() && invCustomFile) {
      formData.append('inventoryImage', invCustomFile);
    }

    const save$ = isEdit
      ? this.store.updateItem(formData)
      : this.store.saveItem(formData);

    save$.subscribe({
      next: () => this.cancelDraft(),
      error: (err: any) => console.error(err?.error?.message || 'Errore salvataggio.')
    });
  }

  deleteItem(itemCode: string): void {
    const item = this.store.currentScene()?.items?.find((i) => i.code === itemCode);
    if (!item?.id) return;

    if (confirm(`Sei sicuro di voler eliminare l'hotspot #${itemCode}?`)) {
      this.store.deleteItem(item.id).subscribe({
        next: () => {
          if (this.editingItemCode() === itemCode) {
            this.cancelDraft();
          }
        },
        error: (err: any) => console.error(err?.error?.message || 'Errore eliminazione.')
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

  openAddAction(): void {
    this.editingAction.set(null);
    this.isActionModalOpen.set(true);
  }

  openEditAction(action: Action): void {
    this.editingAction.set(action);
    this.isActionModalOpen.set(true);
  }

  closeActionModal(): void {
    this.isActionModalOpen.set(false);
    this.editingAction.set(null);
  }

  onSaveAction(actionPayload: Action): void {
    if (!this.store.selectedItem()?.id) return;

    const actionId = this.editingAction()?.id;
    const save$ = actionId
      ? this.store.updateAction({ ...actionPayload, id: actionId })
      : this.store.addAction(actionPayload);

    save$.subscribe({
      next: () => this.closeActionModal(),
      error: (err: any) => {
        console.error('Errore salvataggio azione:', err);
        alert(err?.error?.message || "Impossibile salvare l'azione.");
      }
    });
  }

  onDeleteAction(actionId: number): void {
    if (!actionId) return;

    if (confirm("Vuoi rimuovere questa azione dall'hotspot?")) {
      this.store.deleteAction(actionId).subscribe({
        error: (err: any) => console.error('Errore eliminazione azione:', err)
      });
    }
  }

  goToAddScene(): void {
    const advId = this.store.adventure()?.id
      || Number(this.route.snapshot.paramMap.get('adventureId') || this.route.snapshot.paramMap.get('id'));

    if (advId) {
      void this.router.navigate(['/adventures', advId, 'scenes', 'new']);
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
      error: (err: any) => console.error(err?.error?.message || 'Errore modifica avventura.')
    });
  }
}
