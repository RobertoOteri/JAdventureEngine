import { Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EditorStore } from '../../store/editor.store';
import { Item, Scene } from '../../../../core/models';

export interface SidebarItemEntry {
  item: Item;
  sceneCode: string | null;
  isGlobal: boolean;
  isInventory: boolean;
  isHidden: boolean;
}

export interface SidebarItemGroup {
  code: string;
  name: string;
  isGlobal: boolean;
  items: SidebarItemEntry[];
}

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

  readonly startCreateItemRequested = output<void>();

  readonly collapsedGroups = signal<Record<string, boolean>>({});

  toggleGroup(code: string, event: MouseEvent): void {
    event.stopPropagation();
    this.collapsedGroups.update((current) => ({
      ...current,
      [code]: !current[code]
    }));
  }

  isCollapsed(code: string): boolean {
    return !!this.collapsedGroups()[code];
  }

  readonly itemGroups = computed<SidebarItemGroup[]>(() => {
    const scenes = this.store.scenes() ?? [];
    const allAdventureItems = this.store.adventureItems() ?? [];

    const sceneGroups: SidebarItemGroup[] = scenes.map((scene) => {
      const items = (scene.items ?? []).map((item) => ({
        item,
        sceneCode: scene.code,
        isGlobal: false,
        isInventory: (item.actions ?? []).some((a) => a.type === 'PICK_UP'),
        isHidden: item.hotspot?.initiallyVisible === false
      }));

      return {
        code: scene.code,
        name: scene.name,
        isGlobal: false,
        items
      };
    });

    const globalItems = allAdventureItems
      .filter((i) => !i.hotspot)
      .map((item) => ({
        item,
        sceneCode: null,
        isGlobal: true,
        isInventory: (item.actions ?? []).some((a) => a.type === 'PICK_UP'),
        isHidden: false
      }));

    return [
      ...sceneGroups,
      {
        code: '__global__',
        name: 'Inventario Globale',
        isGlobal: true,
        items: globalItems
      }
    ];
  });

  readonly totalItemsCount = computed(() =>
    this.itemGroups().reduce((acc, g) => acc + g.items.length, 0)
  );

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

  selectSidebarItem(entry: SidebarItemEntry): void {
    const advId = this.getAdventureId();
    const currentScene = this.store.currentScene();

    sessionStorage.setItem('pending_selected_item', entry.item.code);
    this.store.selectItemByCode(entry.item.code);

    if (entry.sceneCode && advId && currentScene?.code !== entry.sceneCode) {
      void this.router.navigate(['/editor', advId, entry.sceneCode]);
    }
  }

  onAddObjectClick(): void {
    this.startCreateItemRequested.emit();
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
