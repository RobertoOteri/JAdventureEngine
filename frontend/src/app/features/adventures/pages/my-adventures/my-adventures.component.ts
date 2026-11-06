import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { GraphicAdventureDto } from '../../../../core/models';
import { SidebarComponent } from '../../../../shared/ui/sidebar/sidebar.component';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';
import { AdventureDetailModalComponent } from '../../../../shared/ui/adventure-detail-modal/adventure-detail-modal.component';
import { SearchBarComponent } from '../../../../shared/ui/search-bar/search-bar.component';
import { FilterSelectComponent } from '../../../../shared/ui/filter-select/filter-select.component';
import { SegmentedControlComponent } from '../../../../shared/ui/segmented-control/segmented-control.component';
import {
  ADVENTURE_SORT_OPTIONS,
  AdventureSort,
  filterAdventures,
  PUBLICATION_OPTIONS,
  PublicationFilter
} from '../../../../core/utils/adventure-filter';

@Component({
  selector: 'app-my-adventures',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    AdventureCardComponent,
    AdventureDetailModalComponent,
    SearchBarComponent,
    FilterSelectComponent,
    SegmentedControlComponent
  ],
  templateUrl: './my-adventures.component.html',
  styleUrl: './my-adventures.component.css'
})
export class MyAdventuresComponent implements OnInit {
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);

  readonly adventures = signal<GraphicAdventureDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedAdventure = signal<GraphicAdventureDto | null>(null);

  readonly query = signal('');
  readonly publication = signal<PublicationFilter>('all');
  readonly sort = signal<AdventureSort>('recent');

  readonly sortOptions = ADVENTURE_SORT_OPTIONS;
  readonly publicationOptions = PUBLICATION_OPTIONS;

  readonly filteredAdventures = computed(() =>
    filterAdventures(this.adventures(), {
      query: this.query(),
      publication: this.publication(),
      sort: this.sort()
    })
  );

  readonly hasActiveFilters = computed(() => !!this.query() || this.publication() !== 'all');

  ngOnInit(): void {
    this.loadAdventures();
  }

  loadAdventures(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adventureService.getMyAdventures().subscribe({
      next: (data: GraphicAdventureDto[]) => {
        this.adventures.set(data);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Errore caricamento avventure personali:', err);
        this.errorMessage.set('Impossibile caricare le tue avventure.');
        this.isLoading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.query.set('');
    this.publication.set('all');
  }

  goToCreate(): void {
    void this.router.navigate(['/adventures/new']);
  }

  playAdventure(adv: GraphicAdventureDto): void {
    void this.router.navigate(['/adventures', adv.id, 'play']);
  }

  onEditAdventure(adv: GraphicAdventureDto): void {
    if (!adv.id) {
      console.error('ID avventura mancante per la modifica.');
      return;
    }
    const sceneCode = adv.initialSceneCode || 'new';
    void this.router.navigate(['/editor', adv.id, sceneCode]);
  }

  onDeleteAdventure(adv: GraphicAdventureDto): void {
    if (!adv.id) {
      console.error('ID avventura mancante per l\'eliminazione.');
      return;
    }

    if (!confirm(`Sei sicuro di voler eliminare definitivamente "${adv.title}"?`)) {
      return;
    }

    this.adventureService.deleteAdventure(adv.id).subscribe({
      next: () => {
        this.adventures.update((prev) => prev.filter((a) => a.id !== adv.id));
        if (this.selectedAdventure()?.id === adv.id) {
          this.selectedAdventure.set(null);
        }
      },
      error: (err: unknown) => {
        console.error('Errore eliminazione avventura:', err);
        alert("Errore durante l'eliminazione dell'avventura.");
      }
    });
  }

  onPlayVersion(adventureId: number): void {
    void this.router.navigate(['/adventures', adventureId, 'play']);
  }
}
