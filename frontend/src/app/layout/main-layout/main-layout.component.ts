import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');

  readonly isScrolled = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed()
    )
      .subscribe(() => {
        this.content()?.nativeElement.scrollTo({ top: 0 });
        this.isScrolled.set(false);
      });
  }

  onScroll(event: Event): void {
    this.isScrolled.set((event.target as HTMLElement).scrollTop > 4);
  }
}
