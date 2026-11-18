import { Component, OnInit, OnDestroy, HostListener, HostBinding, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameplayStore } from './store/gameplay.store';
import { AdventureService } from '../../core/services/adventure.service';
import { ActionType, GraphicAdventureDto } from '../../core/models';
import { normalizeTextBox } from '../../core/models/textbox.model';
import { KeypadDisplayState } from './components/game-viewport/game-viewport.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

import { GameTopbarComponent } from './components/game-topbar/game-topbar.component';
import { GameViewportComponent } from './components/game-viewport/game-viewport.component';
import { GameRadialMenuComponent } from './components/game-radial-menu/game-radial-menu.component';
import { GameInventoryModalComponent } from './components/game-inventory-modal/game-inventory-modal.component';
import { GamePauseModalComponent } from './components/game-pause-modal/game-pause-modal.component';
import { GameEndingModalComponent } from './components/game-ending-modal/game-ending-modal.component';
import { GameLaunchModalComponent } from '../../shared/ui/game-launch-modal/game-launch-modal.component';
import { GameMessageBannerComponent } from './components/game-message-banner/game-message-banner.component';
import { GameDragCursorComponent } from './components/game-drag-cursor/game-drag-cursor.component';
import { GameDialogueOverlayComponent } from './components/game-dialogue-overlay/game-dialogue-overlay.component';
import { GameItemPickupComponent } from './components/game-item-pickup/game-item-pickup.component';

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [
    CommonModule,
    GameTopbarComponent,
    GameViewportComponent,
    GameRadialMenuComponent,
    GameInventoryModalComponent,
    GamePauseModalComponent,
    GameEndingModalComponent,
    GameLaunchModalComponent,
    GameMessageBannerComponent,
    GameDragCursorComponent,
    GameDialogueOverlayComponent,
    GameItemPickupComponent,
    TranslatePipe
  ],
  providers: [GameplayStore],
  templateUrl: './gameplay.component.html',
  styleUrl: './gameplay.component.css'
})
export class GameplayComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);
  private readonly location = inject(Location);

  readonly store = inject(GameplayStore);

  readonly keypadDisplay = computed<KeypadDisplayState | null>(() => {
    const keypadBox = this.store.currentScene()?.keypadBox;
    if (!keypadBox) {
      return null;
    }
    return {
      box: normalizeTextBox(keypadBox),
      value: this.store.typedInput()
    };
  });

  readonly adventureDetails = signal<GraphicAdventureDto | null>(null);
  readonly versions = signal<GraphicAdventureDto[]>([]);
  readonly isLaunchModalOpen = signal<boolean>(true);
  readonly bagBump = signal(0);

  private timerInterval: any = null;

  @HostBinding('class.is-dragging-item')
  get isDraggingItem(): boolean {
    return this.store.draggedItem.isDragging();
  }

  @HostListener('window:keydown.escape')
  handleEscape(): void {
    if (this.isLaunchModalOpen() || this.store.isCompleted() || this.store.activeDialogue()) {
      return;
    }
    if (this.store.inputOverlay()) {
      this.store.closeInputOverlay();
      return;
    }
    if (this.store.radialMenu.isOpen()) {
      this.store.closeRadialMenu();
      return;
    }
    if (this.store.isInventoryOpen()) {
      this.store.setInventoryOpen(false);
      return;
    }
    if (this.store.gameState()) {
      this.store.togglePauseMenu();
    }
  }

  ngOnInit(): void {
    const advId = Number(this.route.snapshot.paramMap.get('adventureId'));

    if (!advId) {
      void this.router.navigate(['/adventures']);
      return;
    }

    this.adventureService.getAdventureById(advId).subscribe({
      next: (adv) => {
        this.adventureDetails.set(adv);
        this.store.setAdventureId(advId);
        this.store.fetchSaves(advId);
        this.loadVersions(adv);
      },
      error: () => void this.router.navigate(['/adventures'])
    });

    this.timerInterval = setInterval(() => {
      const state = this.store.gameState();
      if (state && !state.completed && !this.store.isPauseMenuOpen() && !this.isLaunchModalOpen()) {
        this.store.incrementPlayTime();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private loadVersions(adventure: GraphicAdventureDto): void {
    if (!adventure.id) {
      return;
    }
    this.adventureService.getPublishedVersions(adventure.id).subscribe({
      next: (published) =>
        this.versions.set(adventure.status === 'DRAFT' ? [adventure, ...published] : published),
      error: () => this.versions.set([])
    });
  }

  onVersionChange(versionId: number): void {
    const version = this.versions().find((v) => v.id === versionId);
    if (!version || versionId === this.store.adventureId()) {
      return;
    }
    this.adventureDetails.set(version);
    this.store.setAdventureId(versionId);
    this.store.fetchSaves(versionId);
    this.location.replaceState(
      this.router.serializeUrl(this.router.createUrlTree(['/adventures', versionId, 'play']))
    );
  }

  onStartNew(): void {
    const id = this.store.adventureId();
    if (id) {
      this.store.startNewGame(id);
      this.isLaunchModalOpen.set(false);
    }
  }

  onContinue(): void {
    const id = this.store.adventureId();
    if (id) {
      this.store.continueGame(id);
      this.isLaunchModalOpen.set(false);
    }
  }

  onLoadSave(saveCode: string): void {
    this.store.loadGame(saveCode);
    this.isLaunchModalOpen.set(false);
  }

  onExecuteAction(actionData: { itemCode: string; actionType: ActionType }): void {
    const item = this.store.currentScene()?.items?.find((i) => i.code === actionData.itemCode);
    const inputBox = item?.actions?.find((a) => a.type === actionData.actionType)?.inputBox;

    if (inputBox) {
      this.store.openInputOverlay(
        actionData.itemCode,
        actionData.actionType,
        inputBox
      );
      return;
    }

    this.store.executeAction(actionData);
  }

  onSaveGame(name: string): void {
    this.store.saveCurrentGame(name);
  }

  onExitToLobby(): void {
    this.store.pauseGame();
    this.store.resetStore();
    void this.router.navigate(['/adventures']);
  }

  onPickupArrived(): void {
    this.bagBump.update((value) => value + 1);
  }

  onOpenReviews(): void {
    const id = this.store.adventureId();
    this.store.pauseGame();
    this.store.resetStore();
    void this.router.navigate(id ? ['/adventures', id] : ['/adventures']);
  }

  @HostListener('window:mousemove', ['$event'])
  onGlobalMouseMove(event: MouseEvent): void {
    if (this.store.draggedItem.isDragging()) {
      this.store.updateDragPosition(event.clientX, event.clientY);
    }
  }

  @HostListener('window:mouseup')
  onGlobalMouseUp(): void {
    if (this.store.draggedItem.isDragging()) {
      this.store.cancelDrag();
    }
  }
}
