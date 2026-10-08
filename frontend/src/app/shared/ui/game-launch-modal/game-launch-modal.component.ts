import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSaveDto } from '../../../core/models';
import { GameSavesModalComponent } from '../game-saves-modal/game-saves-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-game-launch-modal',
  standalone: true,
  imports: [
    CommonModule,
    GameSavesModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './game-launch-modal.component.html',
  styleUrl: './game-launch-modal.component.css'
})
export class GameLaunchModalComponent {
  adventureTitle = input<string>('Avventura Grafica');
  saves = input<GameSaveDto[]>([]);

  startNew = output<void>();
  continueGame = output<void>();
  loadSave = output<string>();
  cancel = output<void>();

  isSavesModalOpen = signal<boolean>(false);
  isConfirmOverwriteOpen = signal<boolean>(false);

  hasSaves(): boolean {
    return this.saves().length > 0;
  }

  onNewGameClick(): void {
    if (this.hasSaves()) {
      // Ha già dei salvataggi: chiedi conferma prima di sovrascrivere
      this.isConfirmOverwriteOpen.set(true);
    } else {
      // Prima partita in assoluto: avvia direttamente
      this.startNew.emit();
    }
  }

  onConfirmNewGame(): void {
    this.isConfirmOverwriteOpen.set(false);
    this.startNew.emit();
  }

  onSelectSave(saveCode: string): void {
    this.isSavesModalOpen.set(false);
    this.loadSave.emit(saveCode);
  }
}
