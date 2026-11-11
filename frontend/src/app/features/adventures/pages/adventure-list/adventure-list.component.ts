import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { NotificationService } from '../../../../core/services/notification.service';
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
  selector: 'app-adventure-list',
  standalone: true,
  imports: [
    CommonModule,
    AdventureCardComponent,
    AdventureDetailModalComponent,
    SearchBarComponent,
    FilterSelectComponent,
    TranslatePipe
  ],
  templateUrl: './adventure-list.component.html',
  styleUrl: './adventure-list.component.css'
})
export class AdventureListComponent implements OnInit {
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  readonly favoriteService = inject(FavoriteService);

  readonly adventures = signal<GraphicAdventureDto[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selectedAdventure = signal<GraphicAdventureDto | null>(null);

  readonly query = signal('');
  readonly sort = signal<AdventureSort>('recent');

  readonly sortOptions = ADVENTURE_SORT_OPTIONS;

  readonly filteredAdventures = computed(() =>
    filterAdventures(this.adventures(), {
      query: this.query(),
      sort: this.sort()
    })
  );


  ngOnInit(): void {
    this.loadAdventures();
    this.favoriteService.load();
  }

  loadAdventures(): void {
    this.loading.set(true);
    this.adventureService.getAllAdventures().subscribe({
      next: (data) => {
        this.adventures.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.notifications.httpError(err);
        this.loading.set(false);
      }
    });
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
