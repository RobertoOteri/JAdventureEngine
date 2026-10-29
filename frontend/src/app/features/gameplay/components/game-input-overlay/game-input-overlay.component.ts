import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output
} from '@angular/core';
import { TextBoxDetail } from '../../../../core/models/textbox-detail.model';

const REFERENCE_WIDTH = 1000;
const DEFAULT_COLOR = '#ffffff';

@Component({
  selector: 'app-game-input-overlay',
  standalone: true,
  templateUrl: './game-input-overlay.component.html',
  styleUrl: './game-input-overlay.component.css'
})
export class GameInputOverlayComponent implements AfterViewInit {
  @ViewChild('field', { static: true }) field!: ElementRef<HTMLInputElement>;

  readonly box = input.required<TextBoxDetail>();
  readonly value = input<string>('');

  readonly valueChange = output<string>();
  readonly submitted = output<void>();
  readonly dismissed = output<void>();

  readonly fontFamily = computed(() => this.box().fontFamily ?? 'Arial');

  readonly color = computed(() => this.box().color || DEFAULT_COLOR);

  readonly fontSize = computed(() => {
    const px = parseFloat(this.box().fontSize ?? '16') || 16;
    return `${(px / REFERENCE_WIDTH) * 100}cqw`;
  });

  ngAfterViewInit(): void {
    this.field.nativeElement.focus();
  }
}
