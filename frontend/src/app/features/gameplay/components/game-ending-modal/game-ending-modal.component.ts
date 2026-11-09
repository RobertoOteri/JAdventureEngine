import { Component, computed, input, output, signal } from '@angular/core';
import { LeaderboardComponent } from '../../../../features/leaderboard/leaderboard.component';
import {TranslatePipe} from '../../../../core/i18n/translate.pipe';
import { formatPlayTime } from '../../../../core/utils/time.util';

interface ConfettiPiece {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  color: string;
}

const CONFETTI_COLORS = ['#ffffff', '#fbbf24', '#e2c05c', '#38bdf8', '#a1a1aa'];

@Component({
  selector: 'app-game-ending-modal',
  standalone: true,
  imports: [LeaderboardComponent, TranslatePipe],
  templateUrl: './game-ending-modal.component.html',
  styleUrl: './game-ending-modal.component.css'
})
export class GameEndingModalComponent {
  adventureTitle = input<string>('');
  adventureId = input.required<number>();
  message = input<string | null>(null);
  playTimeSeconds = input<number>(0);

  continueGame = output<void>();
  exit = output<void>();

  readonly isLeaderboardOpen = signal<boolean>(false);

  readonly formattedFinalTime = computed(() => formatPlayTime(this.playTimeSeconds()));

  readonly confetti: ConfettiPiece[] = Array.from({ length: 28 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 7 + Math.random() * 6,
    size: 5 + Math.random() * 5,
    drift: -40 + Math.random() * 80,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  }));
}
