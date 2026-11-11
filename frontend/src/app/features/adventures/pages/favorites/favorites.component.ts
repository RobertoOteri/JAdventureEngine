import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { FavoriteService } from '../../../../core/services/favorite.service';
import { GraphicAdventureDto } from '../../../../core/models';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';
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
    SearchBarComponent,
    FilterSelectComponent,
    TranslatePipe
  ],
  templateUrl: './favorites.component.html',
  styleUrl: '../adventure-list/adventure-list.component.css'
})
export class FavoritesComponent implements OnInit {
  private readonly router = inject(Router);
  readonly favoriteService = inject(FavoriteService);

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

  openDetail(adv: GraphicAdventureDto): void {
    void this.router.navigate(['/adventures', adv.id]);
  }
}
