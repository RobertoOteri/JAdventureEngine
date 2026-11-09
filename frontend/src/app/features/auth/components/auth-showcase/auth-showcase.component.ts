import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationKey } from '../../../../core/i18n/i18n.types';
import { BrandLogoComponent } from '../../../../shared/ui/brand-logo/brand-logo.component';

const COVERS: readonly string[] = [
  '/showcase/fantasy_slide.jpg',
  '/showcase/space_slide.jpg',
  '/showcase/pirate_slide.jpg',
  '/showcase/cyberpunk_slide.jpg',
  '/showcase/train_slide.jpg',
  '/showcase/messy_room_slide.jpg'
];

const FEATURES: readonly TranslationKey[] = [
  'authShowcase.play',
  'authShowcase.create',
  'authShowcase.dialogues',
  'authShowcase.publish',
  'authShowcase.leaderboard',
  'authShowcase.record',
  'authShowcase.save'
];

const INTERVAL_MS = 5500;

@Component({
  selector: 'app-auth-showcase',
  standalone: true,
  imports: [TranslatePipe, BrandLogoComponent],
  templateUrl: './auth-showcase.component.html',
  styleUrl: './auth-showcase.component.css'
})
export class AuthShowcaseComponent {
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private timer?: ReturnType<typeof setInterval>;

  readonly covers = COVERS;
  readonly features = FEATURES;

  private readonly step = signal(0);

  readonly featureIndex = computed(() => this.step() % FEATURES.length);
  readonly feature = computed(() => FEATURES[this.featureIndex()]);
  readonly coverIndex = computed(() => this.step() % COVERS.length);

  constructor() {
    this.start();
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  goTo(featureIndex: number): void {
    this.step.set(featureIndex);
    this.stop();
    this.start();
  }

  private start(): void {
    if (!this.reducedMotion) {
      this.timer = setInterval(() => this.step.update((s) => s + 1), INTERVAL_MS);
    }
  }

  private stop(): void {
    clearInterval(this.timer);
  }
}
