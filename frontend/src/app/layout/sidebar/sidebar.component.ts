import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TranslationKey } from '../../core/i18n/i18n.types';

interface NavItem {
  path: string;
  icon: string;
  labelKey: TranslationKey;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  readonly items: NavItem[] = [
    { path: '/adventures', icon: 'bi-bookshelf', labelKey: 'sidebar.library', exact: true },
    { path: '/adventures/my', icon: 'bi-hammer', labelKey: 'sidebar.myStories' },
    { path: '/adventures/favorites', icon: 'bi-star', labelKey: 'sidebar.favorites' },
    { path: '/profile', icon: 'bi-person', labelKey: 'sidebar.profile' }
  ];
}
