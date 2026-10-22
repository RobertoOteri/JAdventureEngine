import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaderboardEntryDto } from '../../core/models/leaderboard-entry.model';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { formatPlayTime } from '../../core/utils/time.util';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  readonly adventureCode = input.required<string>();
  readonly close = output<void>();

  private readonly leaderboardService = inject(LeaderboardService);

  readonly entries = signal<LeaderboardEntryDto[]>([]);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    const code = this.adventureCode();
    if (code) {
      this.loadLeaderboard(code);
    }
  }

  loadLeaderboard(code: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.leaderboardService.getLeaderboard(code).subscribe({
      next: (data) => {
        this.entries.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Impossibile caricare la classifica.');
        this.loading.set(false);
        console.error('Errore caricamento leaderboard:', err);
      }
    });
  }

  formatTime(totalSeconds: number): string {
    return formatPlayTime(totalSeconds);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
