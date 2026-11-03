import { Component, OnInit, OnDestroy, HostListener, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameplayStore } from './store/gameplay.store';
import { AdventureService } from '../../core/services/adventure.service';
import { Action, ActionType, GraphicAdventureDto } from '../../core/models';

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
    GameDialogueOverlayComponent
  ],
  providers: [GameplayStore],
  templateUrl: './gameplay.component.html',
  styleUrl: './gameplay.component.css'
})
export class GameplayComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);

  readonly store = inject(GameplayStore);

  readonly adventureDetails = signal<GraphicAdventureDto | null>(null);
  readonly isLaunchModalOpen = signal<boolean>(true);

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
    const rawParam =
      this.route.snapshot.paramMap.get('adventureCode') ||
      this.route.snapshot.paramMap.get('adventureId') ||
      this.route.snapshot.paramMap.get('id');

    if (!rawParam) {
      void this.router.navigate(['/adventures']);
      return;
    }

    const isNumericId = /^\d+$/.test(rawParam);

    if (isNumericId) {
      const advId = Number(rawParam);
      this.adventureService.getAdventureById(advId).subscribe({
        next: (adv) => {
          this.adventureDetails.set(adv);
          this.store.setAdventureCode(adv.code);
          this.store.fetchSaves(adv.code);
        },
        error: () => void this.router.navigate(['/adventures'])
      });
    } else {
      this.store.setAdventureCode(rawParam);
      this.store.fetchSaves(rawParam);
      this.adventureService.getAllAdventures().subscribe({
        next: (adventures) => {
          const adv = adventures.find((a) => a.code.toLowerCase() === rawParam.toLowerCase());
          if (adv) {
            this.adventureDetails.set(adv);
          } else {
            void this.router.navigate(['/adventures']);
          }
        },
        error: () => void this.router.navigate(['/adventures'])
      });
    }

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

  onStartNew(): void {
    const code = this.store.adventureCode();
    if (code) {
      this.store.startNewGame(code);
      this.isLaunchModalOpen.set(false);
    }
  }

  onContinue(): void {
    const code = this.store.adventureCode();
    if (code) {
      this.store.continueGame(code);
      this.isLaunchModalOpen.set(false);
    }
  }

  onLoadSave(saveCode: string): void {
    this.store.loadGame(saveCode);
    this.isLaunchModalOpen.set(false);
  }

  onExecuteAction(actionData: { actionCode: string; actionType: ActionType }): void {
    const sources = [...(this.store.currentScene()?.items ?? []), ...this.store.inventory()];
    let foundAction: Action | undefined;

    for (const item of sources) {
      foundAction = item.actions?.find((a) => a.code === actionData.actionCode);
      if (foundAction) {
        break;
      }
    }

    const inputPrecondition = foundAction?.preconditions?.find((p) => p.type === 'INPUT_EQUALS');

    if (inputPrecondition) {
      this.store.openInputOverlay(
        actionData.actionCode,
        actionData.actionType,
        inputPrecondition.textBoxDetail
      );
      return;
    }

    this.store.executeAction(actionData);
  }

  onSaveGame(name: string): void {
    this.store.saveCurrentGame(name);
  }

  onExitToLobby(): void {
    this.store.syncAutoSave();
    this.store.resetStore();
    void this.router.navigate(['/adventures']);
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
