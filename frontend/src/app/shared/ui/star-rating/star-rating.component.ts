import { Component, computed, input, model, signal } from '@angular/core';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

export type StarRatingSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent {
  value = model<number | null>(0);
  readonly = input<boolean>(false);
  size = input<StarRatingSize>('md');

  readonly stars = [1, 2, 3, 4, 5];
  readonly hovered = signal<number | null>(null);

  readonly displayed = computed(() => {
    const hovered = this.hovered();
    if (hovered !== null) {
      return hovered;
    }
    return Math.round((this.value() ?? 0) * 2) / 2;
  });

  iconFor(star: number): string {
    const value = this.displayed();
    if (value >= star) {
      return 'bi-star-fill';
    }
    if (value >= star - 0.5) {
      return 'bi-star-half';
    }
    return 'bi-star';
  }

  rate(star: number): void {
    if (this.readonly()) {
      return;
    }
    this.value.set(star);
  }
}
