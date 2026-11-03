import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { DialogueChoice, DialogueNode } from '../../../../core/models';

const TYPING_SPEED_MS = 18;

@Component({
  selector: 'app-game-dialogue-overlay',
  standalone: true,
  templateUrl: './game-dialogue-overlay.component.html',
  styleUrl: './game-dialogue-overlay.component.css'
})
export class GameDialogueOverlayComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly node = input.required<DialogueNode>();

  readonly choiceSelected = output<number>();
  readonly close = output<void>();

  readonly displayedText = signal<string>('');
  readonly isTypingComplete = signal<boolean>(false);
  readonly selectedIndex = signal<number>(0);

  readonly hasChoices = computed(() => (this.node().choices?.length ?? 0) > 0);

  // Parte di testo non ancora scritta: serve a riservare lo spazio nel layout
  readonly remainingText = computed(() =>
    (this.node().text ?? '').slice(this.displayedText().length)
  );

  private typingTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(
      () => {
        const fullText = this.node().text ?? '';
        this.selectedIndex.set(0);
        this.startTypewriter(fullText);
      },
      { allowSignalWrites: true }
    );

    this.destroyRef.onDestroy(() => this.clearTypingTimer());
  }

  private clearTypingTimer(): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }

  private startTypewriter(fullText: string): void {
    this.clearTypingTimer();
    this.displayedText.set('');
    this.isTypingComplete.set(false);

    if (!fullText) {
      this.isTypingComplete.set(true);
      return;
    }

    let charIndex = 0;
    this.typingTimer = setInterval(() => {
      charIndex++;
      this.displayedText.set(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        this.clearTypingTimer();
        this.isTypingComplete.set(true);
      }
    }, TYPING_SPEED_MS);
  }

  skipTypewriter(): void {
    if (!this.isTypingComplete()) {
      this.clearTypingTimer();
      this.displayedText.set(this.node().text ?? '');
      this.isTypingComplete.set(true);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!this.hasChoices() || !this.isTypingComplete()) {
        return;
      }
      event.preventDefault();

      const count = this.node().choices.length;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.selectedIndex.update((i) => (i + step + count) % count);
      this.scrollSelectedIntoView();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        this.confirm();
      }
    }
  }

  private confirm(): void {
    if (!this.isTypingComplete()) {
      this.skipTypewriter();
      return;
    }

    if (this.hasChoices()) {
      const choice = this.node().choices[this.selectedIndex()];
      if (choice) {
        this.emitChoice(choice);
      }
    } else {
      this.close.emit();
    }
  }

  private emitChoice(choice: DialogueChoice): void {
    if (choice.id != null) {
      this.choiceSelected.emit(choice.id);
    }
  }

  private scrollSelectedIntoView(): void {
    requestAnimationFrame(() => {
      this.host.nativeElement
        .querySelector('.choice-btn.selected')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  onStageClick(): void {
    if (!this.isTypingComplete()) {
      this.skipTypewriter();
    } else if (!this.hasChoices()) {
      this.close.emit();
    }
  }

  onChoose(choice: DialogueChoice, event: MouseEvent): void {
    event.stopPropagation();
    this.emitChoice(choice);
  }

  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit();
  }
}
