import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { GraphicAdventureDto } from '../../../../core/models';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';
import { AdventureDetailModalComponent } from '../../../../shared/ui/adventure-detail-modal/adventure-detail-modal.component';
import { SearchBarComponent } from '../../../../shared/ui/search-bar/search-bar.component';
import { FilterSelectComponent } from '../../../../shared/ui/filter-select/filter-select.component';
import {
  ADVENTURE_SORT_OPTIONS,
  AdventureSort,
  filterAdventures
} from '../../../../core/utils/adventure-filter';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterLink,
    AdventureCardComponent,
    AdventureDetailModalComponent,
    SearchBarComponent,
    FilterSelectComponent,
    TranslatePipe
  ],
  templateUrl: './favorites.component.html',
  // Stesso layout della Libreria: riuso il suo foglio di stile invece di duplicarlo.
  styleUrl: '../adventure-list/adventure-list.component.css'
})
export class FavoritesComponent implements OnInit {
  private readonly router = inject(Router);
  readonly favoriteService = inject(FavoriteService);

  readonly selectedAdventure = signal<GraphicAdventureDto | null>(null);

  readonly query = signal('');
  readonly sort = signal<AdventureSort>('title-asc');

  readonly sortOptions = ADVENTURE_SORT_OPTIONS;

  readonly filteredFavorites = computed(() =>
    filterAdventures(this.favoriteService.favorites(), {
      query: this.query(),
      sort: this.sort()
    })
  );

  ngOnInit(): void {
    this.favoriteService.load();
  }

  resetFilters(): void {
    this.query.set('');
  }

  onPlayAdventure(adv: GraphicAdventureDto): void {
    this.router.navigate(['/adventures', adv.id, 'play']);
  }

  onPlayVersion(adventureId: number): void {
    this.router.navigate(['/adventures', adventureId, 'play']);
  }
}
