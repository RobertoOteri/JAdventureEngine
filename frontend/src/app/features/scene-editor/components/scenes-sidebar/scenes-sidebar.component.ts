import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorStore } from '../../store/editor.store';
import { Scene } from '../../../../core/models';

@Component({
  selector: 'app-scenes-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scenes-sidebar.component.html',
  styleUrl: './scenes-sidebar.component.css'
})
export class ScenesSidebarComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(EditorStore);

  private getAdventureId(): number | null {
    const fromStore = this.store.adventure()?.id;
    if (fromStore) return fromStore;

    const fromRoute = this.route.snapshot.paramMap.get('adventureId') || this.route.snapshot.paramMap.get('id');
    return fromRoute ? Number(fromRoute) : null;
  }

  switchScene(scene: Scene): void {
    const advId = this.getAdventureId();
    const currentScene = this.store.currentScene();

    if (advId && scene.code && scene.code !== currentScene?.code) {
      void this.router.navigate(['/editor', advId, scene.code]);
    }
  }

  goToAddScene(): void {
    const advId = this.getAdventureId();
    if (advId) {
      void this.router.navigate(['/adventures', advId, 'scenes', 'new']);
    } else {
      console.error('Nessun adventureId trovato per la navigazione');
    }
  }

  deleteScene(event: MouseEvent, scene: Scene): void {
    event.stopPropagation();

    if (!scene.id) {
      console.error('ID scena mancante per eliminazione.');
      return;
    }

    const advId = this.getAdventureId();
    if (!advId) return;

    if (confirm(`Sei sicuro di voler eliminare la stanza "${scene.name}"?`)) {
      this.store.deleteScene(scene.id).subscribe({
        next: () => {
          const remaining = this.store.scenes();
          if (remaining.length > 0) {
            void this.router.navigate(['/editor', advId, remaining[0].code]);
          } else {
            void this.router.navigate(['/editor', advId]);
          }
        },
        error: (err: any) => console.error(err?.error?.message || 'Errore eliminazione scena')
      });
    }
  }
}
