import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditorStore } from '../../store/editor.store';

@Component({
  selector: 'app-scenes-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scenes-sidebar.component.html',
  styleUrl: './scenes-sidebar.component.css'
})
export class ScenesSidebarComponent {
  private readonly router = inject(Router);
  readonly store = inject(EditorStore);

  switchScene(sceneCode: string): void {
    const advCode = this.store.adventure()?.code;
    if (advCode && sceneCode && sceneCode !== this.store.currentScene()?.code) {
      this.router.navigate(['/editor', advCode, sceneCode]);
    }
  }

  goToAddScene(): void {
    const advCode = this.store.adventure()?.code;
    if (advCode) {
      this.router.navigate(['/adventures', advCode, 'scenes', 'new']);
    }
  }

  deleteScene(event: MouseEvent, sceneCode: string): void {
    event.stopPropagation();
    const advCode = this.store.adventure()?.code;
    if (!advCode) return;

    if (confirm(`Sei sicuro di voler eliminare la scena #${sceneCode}?`)) {
      this.store.deleteScene(sceneCode).subscribe({
        next: () => {
          const remaining = this.store.scenes();
          if (remaining.length > 0) {
            void this.router.navigate(['/editor', advCode, remaining[0].code]);
          } else {
            void this.router.navigate(['/editor', advCode]);
          }
        },
        error: (err: any) => console.error(err?.error?.message || 'Errore eliminazione scena')
      });
    }
  }
}
