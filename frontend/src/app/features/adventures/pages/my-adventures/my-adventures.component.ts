import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { GraphicAdventureDto } from '../../../../core/models';
import { SidebarComponent } from '../../../../shared/ui/sidebar/sidebar.component';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';
import { AdventureDetailModalComponent } from '../../../../shared/ui/adventure-detail-modal/adventure-detail-modal.component';

@Component({
  selector: 'app-my-adventures',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    AdventureCardComponent,
    AdventureDetailModalComponent
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

  goToCreate(): void {
    this.router.navigate(['/adventures/new']);
  }

  playAdventure(code: string): void {
    this.router.navigate(['/game', code]);
  }

  onEditAdventure(adv: GraphicAdventureDto): void {
    const sceneCode = adv.initialSceneCode || 'new';
    this.router.navigate(['/editor', adv.code, sceneCode]);
  }

  onDeleteAdventure(adv: GraphicAdventureDto): void {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente "${adv.title}"?`)) {
      return;
    }

    this.adventureService.deleteAdventure(adv.code).subscribe({
      next: () => {
        this.adventures.update((prev) => prev.filter((a) => a.code !== adv.code));
        if (this.selectedAdventure()?.code === adv.code) {
          this.selectedAdventure.set(null);
        }
      },
      error: (err: unknown) => {
        console.error('Errore eliminazione avventura:', err);
        alert("Errore durante l'eliminazione dell'avventura.");
      }
    });
  }
}
