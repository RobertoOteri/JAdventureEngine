import { Component, OnInit, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameplayStore } from './store/gameplay.store';
import { AdventureService } from '../../core/services/adventure.service';
import { GameActionDto, GraphicAdventureDto } from '../../core/models';

import { GameTopbarComponent } from './components/game-topbar/game-topbar.component';
import { GameViewportComponent } from './components/game-viewport/game-viewport.component';
import { GameRadialMenuComponent } from './components/game-radial-menu/game-radial-menu.component';
import { GameInventoryModalComponent } from './components/game-inventory-modal/game-inventory-modal.component';
import { GamePauseModalComponent } from './components/game-pause-modal/game-pause-modal.component';
import { GameLaunchModalComponent } from '../../shared/ui/game-launch-modal/game-launch-modal.component';
import { GameMessageBannerComponent } from './components/game-message-banner/game-message-banner.component';

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
    GameLaunchModalComponent,
    GameMessageBannerComponent
  ],
  providers: [GameplayStore],
  templateUrl: './gameplay.component.html',
  styleUrl: './gameplay.component.css'
})
export class GameplayComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adventureService = inject(AdventureService);

  readonly store = inject(GameplayStore);

  readonly adventureDetails = signal<GraphicAdventureDto | null>(null);
  readonly isLaunchModalOpen = signal<boolean>(true);

  @HostListener('window:keydown.escape')
  handleEscape(): void {
    if (this.isLaunchModalOpen()) {
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
    const adventureCode = this.route.snapshot.paramMap.get('adventureCode');
    if (!adventureCode) {
      this.router.navigate(['/adventures']);
      return;
    }

    this.store.setAdventureCode(adventureCode);
    this.store.fetchSaves(adventureCode);

    this.adventureService.getAdventureByCode(adventureCode).subscribe({
      next: (adv) => this.adventureDetails.set(adv),
      error: () => this.router.navigate(['/adventures'])
    });
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

  onExecuteAction(action: GameActionDto): void {
    this.store.executeAction(action);
  }

  onSaveGame(name: string): void {
    this.store.saveCurrentGame(name);
  }

  onExitToLobby(): void {
    this.store.resetStore();
    this.router.navigate(['/adventures']);
  }
}
