import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewDto } from '../../../../core/models';
import { ReviewService } from '../../../../core/services/review.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { StarRatingComponent } from '../../../../shared/ui/star-rating/star-rating.component';
import { UserAvatarComponent } from '../../../../shared/ui/user-avatar/user-avatar.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe, StarRatingComponent, UserAvatarComponent],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css'
})
export class ReviewListComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly adventureId = input.required<number>();

  private readonly loaded = signal<ReviewDto[]>([]);
  private nextPage = 0;

  readonly loading = signal<boolean>(false);
  readonly hasMore = signal<boolean>(false);

  readonly reviews = computed(() => {
    const me = this.authService.currentUsername();
    return this.loaded().filter((review) => review.username !== me);
  });

  constructor() {
    effect(() => {
      const adventureId = this.adventureId();
      untracked(() => this.reset(adventureId));
    });
  }

  loadMore(): void {
    if (this.loading() || !this.hasMore()) {
      return;
    }
    this.fetchPage(this.adventureId());
  }

  private reset(adventureId: number): void {
    this.loaded.set([]);
    this.nextPage = 0;
    this.hasMore.set(false);
    this.fetchPage(adventureId);
  }

  private fetchPage(adventureId: number): void {
    this.loading.set(true);
    this.reviewService.getReviews(adventureId, this.nextPage, PAGE_SIZE).subscribe({
      next: (page) => {
        this.loaded.update((current) => [...current, ...page]);
        this.nextPage++;
        this.hasMore.set(page.length === PAGE_SIZE);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notifications.httpError(err, 'reviews.loadError');
      }
    });
  }
}
