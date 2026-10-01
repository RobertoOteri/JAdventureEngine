import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphicAdventureResponse } from '../../../core/models';

@Component({
  selector: 'app-adventure-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adventure-card.component.html',
  styleUrl: './adventure-card.component.css'
})
export class AdventureCardComponent {
  readonly adventure = input.required<GraphicAdventureResponse>();
  readonly isAuthor = input<boolean>(false);

  readonly play = output<string>();
  readonly edit = output<GraphicAdventureResponse>();
  readonly delete = output<GraphicAdventureResponse>();
  readonly info = output<GraphicAdventureResponse>();

  readonly coverUrl = computed(() => {
    const rawUrl = this.adventure().coverImageUrl;
    if (!rawUrl) return null;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    return `http://localhost:8080${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  });

  onCardClick(): void {
    if (this.isAuthor()) {
      this.edit.emit(this.adventure());
    } else {
      this.play.emit(this.adventure().code);
    }
  }

  onPlay(event: MouseEvent): void {
    event.stopPropagation();
    this.play.emit(this.adventure().code);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.adventure());
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.adventure());
  }

  onInfo(event: MouseEvent): void {
    event.stopPropagation();
    this.info.emit(this.adventure());
  }
}
