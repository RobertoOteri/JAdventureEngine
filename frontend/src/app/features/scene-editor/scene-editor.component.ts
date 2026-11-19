import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EditorStore } from './store/editor.store';
import { Action, Item } from '../../core/models';
import { EditorHeaderComponent } from './components/editor-header/editor-header.component';
import { ScenesSidebarComponent } from './components/scenes-sidebar/scenes-sidebar.component';
import { Point2D, SceneCanvasComponent } from './components/scene-canvas/scene-canvas.component';
import { InspectorSidebarComponent } from './components/inspector-sidebar/inspector-sidebar.component';
import { ActionModalComponent } from './components/action-modal/action-modal.component';
import { AdventureCreateComponent } from '../adventures/pages/adventure-create/adventure-create.component';
import { TranslationService } from '../../core/i18n/translation.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-scene-editor',
  standalone: true,
  imports: [
    EditorHeaderComponent,
    ScenesSidebarComponent,
    SceneCanvasComponent,
    InspectorSidebarComponent,
    ActionModalComponent,
    AdventureCreateComponent
  ],
  templateUrl: './scene-editor.component.html',
  styleUrl: './scene-editor.component.css'
})
export class SceneEditorComponent implements OnInit, OnDestroy {
  private readonly i18n = inject(TranslationService);
  private readonly confirm = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(EditorStore);

  @ViewChild('canvasRef') canvasRef?: SceneCanvasComponent;

  readonly isEditingOrCreating = signal<boolean>(false);
  readonly editingItemCode = signal<string | null>(null);

  readonly itemName = signal<string>('');
  readonly itemCode = signal<string>('');
  readonly itemDescription = signal<string>('');
  readonly isCollectible = signal<boolean>(false);
  readonly isInitiallyVisible = signal<boolean>(true);

  readonly sceneImageFile = signal<File | null>(null);
  readonly previewSpriteUrl = signal<string | null>(null);

  readonly spritePosX = signal<number>(350);
  readonly spritePosY = signal<number>(350);
  readonly spriteWidth = signal<number>(200);
  readonly spriteHeight = signal<number>(200);

  readonly isActionModalOpen = signal<boolean>(false);
  readonly isActionForInventory = signal<boolean>(false);
  readonly editingAction = signal<Action | null>(null);

  readonly isAdventureModalOpen = signal<boolean>(false);

  private activePreviewBlobUrl: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const rawAdventure = params.get('adventureCode') || params.get('adventureId') || params.get('id');
      const sceneIdParam = params.get('sceneId');
      const sceneCode = params.get('sceneCode') || undefined;

      if (!this.store.pendingItemCode()) {
        this.cancelDraft();
      }

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
    this.itemDescription.set(item.description ?? '');
    this.spritePosX.set(item.hotspot?.posX ?? 350);
    this.spritePosY.set(item.hotspot?.posY ?? 350);
    this.spriteWidth.set(item.hotspot?.width && item.hotspot.width > 0 ? item.hotspot.width : 200);
    this.spriteHeight.set(item.hotspot?.height && item.hotspot.height > 0 ? item.hotspot.height : 200);

    this.isInitiallyVisible.set(
      item.hotspot?.initiallyVisible !== undefined ? Boolean(item.hotspot.initiallyVisible) : true
    );

    this.revokeCurrentBlob();
    if (item.imageUrl) {
      this.previewSpriteUrl.set(item.imageUrl);
      this.canvasRef?.setTool('MOVE');
    } else {
      this.previewSpriteUrl.set(null);
      this.canvasRef?.setTool('HOTSPOT');
    }

    this.canvasRef?.clearDraftPoints();
    if (item.hotspot?.points && item.hotspot.points.trim().length > 0) {
      const parsedPoints: Point2D[] = item.hotspot.points
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
    this.itemDescription.set('');
    this.isCollectible.set(false);
    this.isInitiallyVisible.set(true);
    this.sceneImageFile.set(null);
    this.previewSpriteUrl.set(null);

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
    }
  }

  saveDraft(): void {
    const name = this.itemName().trim();
    const code = this.itemCode().trim();
    const description = this.itemDescription().trim() || name;

    if (!name || !code) return;

    let points = this.canvasRef?.draftPolygonPoints() || '';
    const selected = this.store.selectedItem();

    if (!points && this.editingItemCode() && selected?.hotspot?.points) {
      points = selected.hotspot.points;
    }

    const isEdit = !!this.editingItemCode();
    const targetItemId = selected?.id;

    if (isEdit && !targetItemId) {
      return;
    }

    const hasValidHotspot = Boolean(points && points.split(/\s+/).length >= 3);

    const itemPayload: any = {
      ...(isEdit ? { id: targetItemId } : {}),
      name,
      code,
      description,
      ...(hasValidHotspot
        ? {
          hotspot: {
            points,
            posX: Math.round(this.spritePosX()),
            posY: Math.round(this.spritePosY()),
            width: Math.round(this.spriteWidth()),
            height: Math.round(this.spriteHeight()),
            initiallyVisible: this.isInitiallyVisible()
          }
        }
        : {
          hotspot: null
        })
    };

    const sceneFile = this.sceneImageFile();
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(itemPayload)], { type: 'application/json' })
    );

    if (sceneFile) {
      formData.append('image', sceneFile);
    }

    let save$: Observable<Item>;
    if (isEdit) {
      save$ = this.store.updateItem(formData);
    } else if (hasValidHotspot) {
      save$ = this.store.saveItem(formData);
    } else {
      save$ = this.store.saveInventoryItem(formData);
    }

    save$.subscribe({
      next: () => this.cancelDraft(),
      error: () => undefined
    });
  }

  async deleteItem(itemCode: string): Promise<void> {
    const item = this.store.findItemEverywhere(itemCode);
    if (!item?.id) return;

    const confirmed = await this.confirm.ask({
      title: this.i18n.t('confirmation.deleteTitle'),
      message: this.i18n.t('sceneEditor.confirmDeleteItem', { code: itemCode }),
      confirmText: this.i18n.t('common.delete')
    });
    if (!confirmed) return;

    this.store.deleteItem(item.id).subscribe({
      next: () => {
        if (this.editingItemCode() === itemCode) {
          this.cancelDraft();
        }
      },
      error: () => undefined
    });
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
    const x = Math.max(0, Math.round(drop.x - size / 2));
    const y = Math.max(0, Math.round(drop.y - size / 2));

    this.spritePosX.set(x);
    this.spritePosY.set(y);
    this.spriteWidth.set(size);
    this.spriteHeight.set(size);

    this.canvasRef?.setDraftPoints([
      { x, y },
      { x: x + size, y },
      { x: x + size, y: y + size },
      { x, y: y + size }
    ]);

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
    this.isActionForInventory.set(false);
    this.editingAction.set(null);
    this.isActionModalOpen.set(true);
  }

  openEditAction(action: Action): void {
    this.isActionForInventory.set(false);
    this.editingAction.set(action);
    this.isActionModalOpen.set(true);
  }

  closeActionModal(): void {
    this.isActionModalOpen.set(false);
    this.editingAction.set(null);
  }

  onSaveAction(actionPayload: Action): void {
    const selected = this.store.selectedItem();
    if (!selected) return;

    const actionId = this.editingAction()?.id;
    let save$: Observable<Action>;

    if (actionId) {
      save$ = this.store.updateAction({ ...actionPayload, id: actionId });
    } else {
      save$ = this.store.addAction(actionPayload);
    }

    save$.subscribe({
      next: () => this.closeActionModal(),
      error: () => undefined
    });
  }

  async onDeleteAction(actionId: number): Promise<void> {
    if (!actionId) return;

    const confirmed = await this.confirm.ask({
      title: this.i18n.t('confirmation.deleteTitle'),
      message: this.i18n.t('sceneEditor.confirmDeleteAction'),
      confirmText: this.i18n.t('common.delete')
    });
    if (!confirmed) return;

    this.store.deleteAction(actionId).subscribe({ error: () => undefined });
  }

  goToAddScene(): void {
    const advId =
      this.store.adventure()?.id ||
      Number(this.route.snapshot.paramMap.get('adventureId') || this.route.snapshot.paramMap.get('id'));

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
      error: () => undefined
    });
  }

  openDialogues(item: Item): void {
    const advId = this.store.adventure()?.id;
    if (!advId || !item.id) return;

    void this.router.navigate(['/adventures', advId, 'items', item.id, 'dialogues']);
  }
}
