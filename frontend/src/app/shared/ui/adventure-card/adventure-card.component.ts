import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphicAdventureDto } from '../../../core/models';

@Component({
  selector: 'app-adventure-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adventure-card.component.html',
  styleUrl: './adventure-card.component.css'
})
export class AdventureCardComponent {
  readonly adventure = input.required<GraphicAdventureDto>();
  readonly isAuthor = input<boolean>(false);

  readonly play = output<GraphicAdventureDto>();
  readonly edit = output<GraphicAdventureDto>();
  readonly delete = output<GraphicAdventureDto>();
  readonly info = output<GraphicAdventureDto>();

  onCardClick(): void {
    if (this.isAuthor()) {
      this.edit.emit(this.adventure());
    } else {
      this.play.emit(this.adventure());
    }
  }

  onPlay(event: MouseEvent): void {
    event.stopPropagation();
    this.play.emit(this.adventure());
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
