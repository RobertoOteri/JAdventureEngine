import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { GraphicAdventureDto } from '../../../../core/models';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';
import { SearchBarComponent } from '../../../../shared/ui/search-bar/search-bar.component';
import { FilterSelectComponent } from '../../../../shared/ui/filter-select/filter-select.component';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationKey } from '../../../../core/i18n/i18n.types';
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
    AdventureCardComponent,
    SearchBarComponent,
    FilterSelectComponent,
    SegmentedControlComponent,
    TranslatePipe
  ],
  templateUrl: './my-adventures.component.html',
  styleUrl: './my-adventures.component.css'
})
export class MyAdventuresComponent implements OnInit {
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);

  private readonly i18n = inject(TranslationService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  readonly adventures = signal<GraphicAdventureDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<TranslationKey | null>(null);

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
      error: () => {
        this.errorMessage.set('myAdventures.loadError');
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
      return;
    }
    const sceneCode = adv.initialSceneCode || 'new';
    void this.router.navigate(['/editor', adv.id, sceneCode]);
  }

  async onDeleteAdventure(adv: GraphicAdventureDto): Promise<void> {
    if (!adv.id) {
      return;
    }

    const confirmed = await this.confirm.ask({
      title: this.i18n.t('confirmation.deleteTitle'),
      message: this.i18n.t('myAdventures.confirmDelete', { title: adv.title }),
      confirmText: this.i18n.t('common.delete')
    });
    if (!confirmed) {
      return;
    }

    this.adventureService.deleteAdventure(adv.id).subscribe({
      next: () => {
        this.adventures.update((prev) => prev.filter((a) => a.id !== adv.id));
      },
      error: (err: unknown) => this.notifications.httpError(err, 'myAdventures.deleteError')
    });
  }

  openDetail(adv: GraphicAdventureDto): void {
    void this.router.navigate(['/adventures', adv.id]);
  }
}
