import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditorStore } from '../../store/editor.store';

@Component({
  selector: 'app-editor-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor-header.component.html',
  styleUrl: './editor-header.component.css'
})
export class EditorHeaderComponent {
  private readonly router = inject(Router);
  readonly store = inject(EditorStore);

  readonly draftPointsCount = input<number>(0);

  readonly undoPoint = output<void>();
  readonly editAdventureRequested = output<void>();

  goBackToAdventures(): void {
    this.router.navigate(['/adventures/my']);
  }
}
