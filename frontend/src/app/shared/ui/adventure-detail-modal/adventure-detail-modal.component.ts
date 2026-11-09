import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GraphicAdventureDto } from '../../../core/models';
import { AdventureService } from '../../../core/services/adventure.service';
import { LeaderboardComponent } from '../../../features/leaderboard/leaderboard.component';
import { VersionSelectComponent } from '../version-select/version-select.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-adventure-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, LeaderboardComponent, VersionSelectComponent, TranslatePipe],
  templateUrl: './adventure-detail-modal.component.html',
  styleUrl: './adventure-detail-modal.component.css'
})
export class AdventureDetailModalComponent implements OnInit {
  private readonly adventureService = inject(AdventureService);

  readonly adventure = input.required<GraphicAdventureDto>();
  readonly close = output<void>();
  readonly play = output<number>();

  readonly isLeaderboardOpen = signal<boolean>(false);

  readonly versions = signal<GraphicAdventureDto[]>([]);
  readonly selectedVersionId = signal<number | null>(null);

  readonly playableId = computed(() => this.selectedVersionId() ?? this.adventure().id ?? null);

  readonly hasLeaderboard = computed(() => this.selectedVersionId() !== null);

  ngOnInit(): void {
    const adventureId = this.adventure().id;
    if (!adventureId) {
      return;
    }

    this.adventureService.getPublishedVersions(adventureId).subscribe({
      next: (list) => {
        this.versions.set(list);
        const opened = list.find((v) => v.id === adventureId);
        this.selectedVersionId.set(opened?.id ?? list[0]?.id ?? null);
      },
      error: () => this.versions.set([])
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onPlay(): void {
    const id = this.playableId();
    if (id) {
      this.play.emit(id);
    }
  }
}
