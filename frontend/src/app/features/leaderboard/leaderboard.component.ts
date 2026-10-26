import { Component, HostListener, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaderboardEntryDto } from '../../core/models/leaderboard-entry.model';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { formatPlayTime } from '../../core/utils/time.util';

interface RankedEntry {
  entry: LeaderboardEntryDto;
  rank: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  readonly adventureCode = input.required<string>();
  readonly adventureTitle = input<string>('');
  readonly close = output<void>();

  private readonly leaderboardService = inject(LeaderboardService);

  readonly entries = signal<LeaderboardEntryDto[]>([]);
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  readonly skeletonRows = [1, 2, 3, 4, 5];

  readonly bestTime = computed(() => this.entries()[0]?.playTime ?? 0);

  readonly podium = computed<RankedEntry[]>(() => {
    const [first, second, third] = this.entries()
      .slice(0, 3)
      .map((entry, i) => ({ entry, rank: i + 1 }));
    return [second, first, third].filter((r): r is RankedEntry => !!r);
  });

  readonly rest = computed<RankedEntry[]>(() =>
    this.entries()
      .slice(3)
      .map((entry, i) => ({ entry, rank: i + 4 }))
  );

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

  formatDelta(totalSeconds: number): string {
    return '+' + formatPlayTime(Math.max(0, totalSeconds - this.bestTime()));
  }

  initial(name: string): string {
    return (name.trim().charAt(0) || '?').toUpperCase();
  }

  hue(name: string): number {
    let h = 0;
    for (const ch of name) {
      h = (h * 31 + ch.charCodeAt(0)) % 360;
    }
    return h;
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
