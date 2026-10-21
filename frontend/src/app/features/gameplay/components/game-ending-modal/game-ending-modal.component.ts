import { Component, computed, input, output, signal } from '@angular/core';
import { LeaderboardComponent } from '../../../../features/leaderboard/leaderboard.component';

@Component({
  selector: 'app-game-ending-modal',
  standalone: true,
  imports: [LeaderboardComponent],
  templateUrl: './game-ending-modal.component.html',
  styleUrl: './game-ending-modal.component.css'
})
export class GameEndingModalComponent {
  adventureTitle = input<string>('Avventura');
  adventureCode = input.required<string>();
  message = input<string | null>(null);
  playTimeSeconds = input<number>(0);

  continueGame = output<void>();
  exit = output<void>();

  readonly isLeaderboardOpen = signal<boolean>(false);

  formattedFinalTime = computed(() => {
    const total = this.playTimeSeconds();
    const mins = Math.floor(total / 60).toString().padStart(2, '0');
    const secs = (total % 60).toString().padStart(2, '0');
    const hours = Math.floor(total / 3600);
    return hours > 0 ? `${hours} ore e ${mins} min` : `${mins} minuti e ${secs} secondi`;
  });
}
