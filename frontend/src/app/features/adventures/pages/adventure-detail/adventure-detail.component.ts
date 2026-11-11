import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdventureService } from '../../../../core/services/adventure.service';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { GraphicAdventureDto, RatingSummaryDto } from '../../../../core/models';
import { ReviewService } from '../../../../core/services/review.service';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { StarRatingComponent } from '../../../../shared/ui/star-rating/star-rating.component';
import { AuthService } from '../../../../core/services/auth.service';
import { MyReviewComponent } from '../../components/my-review/my-review.component';
import { ReviewListComponent } from '../../components/review-list/review-list.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { LeaderboardComponent } from '../../../leaderboard/leaderboard.component';

@Component({
  selector: 'app-adventure-detail',
  standalone: true,
  imports: [DatePipe, TranslatePipe, LeaderboardComponent, StarRatingComponent, MyReviewComponent, ReviewListComponent],
  templateUrl: './adventure-detail.component.html',
  styleUrl: './adventure-detail.component.css'
})
export class AdventureDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adventureService = inject(AdventureService);
  private readonly notifications = inject(NotificationService);
  private readonly reviewService = inject(ReviewService);
  private readonly i18n = inject(TranslationService);
  private readonly authService = inject(AuthService);
  readonly favoriteService = inject(FavoriteService);

  readonly adventure = signal<GraphicAdventureDto | null>(null);
  readonly loading = signal<boolean>(true);
  readonly isLeaderboardOpen = signal<boolean>(false);
  readonly summary = signal<RatingSummaryDto | null>(null);

  readonly starLevels = [5, 4, 3, 2, 1];

  readonly formattedAverage = computed(() => {
    const average = this.summary()?.averageRating;
    if (average === null || average === undefined) {
      return '–';
    }
    return new Intl.NumberFormat(this.i18n.lang(), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(average);
  });

  readonly isDraft = computed(() => this.adventure()?.status === 'DRAFT');

  readonly isAuthor = computed(() => this.adventure()?.authorUsername === this.authService.currentUsername());

  readonly hasLeaderboard = computed(() => !!this.adventure()?.id && !this.isDraft());

  readonly isFavorite = computed(() => {
    const adventure = this.adventure();
    return !!adventure && this.favoriteService.favoriteCodes().has(adventure.code);
  });

  constructor() {
    this.favoriteService.load();
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.loadAdventure(Number(params.get('adventureId'))));
  }

  play(): void {
    const id = this.adventure()?.id;
    if (id) {
      void this.router.navigate(['/adventures', id, 'play']);
    }
  }

  toggleFavorite(): void {
    const adventure = this.adventure();
    if (adventure) {
      this.favoriteService.toggle(adventure);
    }
  }

  barPercent(stars: number): number {
    const summary = this.summary();
    if (!summary || summary.reviewCount === 0) {
      return 0;
    }
    return ((summary.distribution[stars] ?? 0) / summary.reviewCount) * 100;
  }

  reloadSummary(): void {
    const id = this.adventure()?.id;
    if (id) {
      this.loadSummary(id);
    }
  }

  private loadSummary(adventureId: number): void {
    this.reviewService.getSummary(adventureId).subscribe({
      next: (summary) => this.summary.set(summary),
      error: (err) => this.notifications.httpError(err, 'reviews.loadError')
    });
  }

  private loadAdventure(adventureId: number): void {
    if (!Number.isFinite(adventureId)) {
      void this.router.navigate(['/adventures']);
      return;
    }

    this.loading.set(true);
    this.isLeaderboardOpen.set(false);
    this.summary.set(null);
    this.adventureService.getAdventureById(adventureId).subscribe({
      next: (adventure) => {
        this.adventure.set(adventure);
        this.loading.set(false);
        this.loadSummary(adventureId);
      },
      error: (err) => {
        this.notifications.httpError(err);
        this.loading.set(false);
        void this.router.navigate(['/adventures']);
      }
    });
  }
}
