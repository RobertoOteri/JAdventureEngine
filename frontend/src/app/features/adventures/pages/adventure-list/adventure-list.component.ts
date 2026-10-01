import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { GraphicAdventureResponse } from '../../../../core/models';
import { SidebarComponent } from '../../../../shared/ui/sidebar/sidebar.component';
import { AdventureCardComponent } from '../../../../shared/ui/adventure-card/adventure-card.component';
import { AdventureDetailModalComponent } from '../../../../shared/ui/adventure-detail-modal/adventure-detail-modal.component';

@Component({
  selector: 'app-adventure-list',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    AdventureCardComponent,
    AdventureDetailModalComponent
  ],
  templateUrl: './adventure-list.component.html',
  styleUrls: ['./adventure-list.component.css']
})
export class AdventureListComponent implements OnInit {
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);

  readonly adventures = signal<GraphicAdventureResponse[]>([]);
  readonly loading = signal<boolean>(true);

  readonly selectedAdventure = signal<GraphicAdventureResponse | null>(null);

  ngOnInit(): void {
    this.loadAdventures();
  }

  loadAdventures(): void {
    this.loading.set(true);
    this.adventureService.getAllAdventures().subscribe({
      next: (data) => {
        this.adventures.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento avventure:', err);
        this.loading.set(false);
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/adventures/new']);
  }

  onPlayAdventure(code: string): void {
    this.router.navigate(['/game', code]);
  }
}
