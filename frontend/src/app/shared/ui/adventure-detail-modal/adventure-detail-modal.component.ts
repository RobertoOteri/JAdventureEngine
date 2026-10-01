import { Component, computed, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GraphicAdventureResponse } from '../../../core/models';

@Component({
  selector: 'app-adventure-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './adventure-detail-modal.component.html',
  styleUrl: './adventure-detail-modal.component.css'
})
export class AdventureDetailModalComponent {
  readonly adventure = input.required<GraphicAdventureResponse>();
  readonly close = output<void>();
  readonly play = output<string>();

  readonly coverUrl = computed(() => {
    const rawUrl = this.adventure().coverImageUrl;
    if (!rawUrl) return null;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    return `http://localhost:8080${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  });

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onPlay(): void {
    this.play.emit(this.adventure().code);
  }
}
