import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output
} from '@angular/core';
import { TEXTBOX_GRID, TextBox } from '../../../../core/models/textbox.model';


@Component({
  selector: 'app-game-input-overlay',
  standalone: true,
  templateUrl: './game-input-overlay.component.html',
  styleUrl: './game-input-overlay.component.css'
})
export class GameInputOverlayComponent implements AfterViewInit {
  @ViewChild('field', { static: true }) field!: ElementRef<HTMLInputElement>;

  readonly box = input.required<TextBox>();
  readonly value = input<string>('');

  readonly valueChange = output<string>();
  readonly submitted = output<void>();
  readonly dismissed = output<void>();

  readonly fontFamily = computed(() => this.box().fontFamily);

  readonly color = computed(() => this.box().color);

  readonly fontSize = computed(() => `${(this.box().fontSize / TEXTBOX_GRID) * 100}cqw`);

  ngAfterViewInit(): void {
    this.field.nativeElement.focus();
  }
}
