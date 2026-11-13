import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/pages/auth.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [guestGuard],
    data: { mode: 'login' }
  },
  {
    path: 'register',
    component: AuthComponent,
    canActivate: [guestGuard],
    data: { mode: 'register' }
  },
  {
    path: 'auth',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'adventures/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/adventures/pages/adventure-create/adventure-create.component').then(
        (m) => m.AdventureCreateComponent
      )
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'adventures',
        loadComponent: () =>
          import('./features/adventures/pages/adventure-list/adventure-list.component').then(
            (m) => m.AdventureListComponent
          )
      },
      {
        path: 'adventures/favorites',
        loadComponent: () =>
          import('./features/adventures/pages/favorites/favorites.component').then(
            (m) => m.FavoritesComponent
          )
      },
      {
        path: 'adventures/my',
        loadComponent: () =>
          import('./features/adventures/pages/my-adventures/my-adventures.component').then(
            (m) => m.MyAdventuresComponent
          )
      },
      {
        path: 'adventures/:adventureId',
        loadComponent: () =>
          import('./features/adventures/pages/adventure-detail/adventure-detail.component').then(
            (m) => m.AdventureDetailComponent
          )
      },
      {
        path: 'users/:username',
        loadComponent: () =>
          import('./features/profile/pages/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          )
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      }
    ]
  },

  {
    path: 'adventures/:adventureId/scenes/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/scene-editor/components/scene-create/scene-create.component').then(
        (m) => m.SceneCreateComponent
      )
  },
  {
    path: 'adventures/:adventureId/play',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/gameplay/gameplay.component').then((m) => m.GameplayComponent)
  },
  {
    path: 'editor/:adventureId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/scene-editor/scene-editor.component').then((m) => m.SceneEditorComponent)
  },
  {
    path: 'editor/:adventureId/:sceneCode',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/scene-editor/scene-editor.component').then((m) => m.SceneEditorComponent)
  },
  {
    path: 'adventures/:adventureId/items/:itemId/dialogues',
    loadComponent: () =>
      import('./features/dialogue-editor/dialogue-editor.component').then(
        (m) => m.DialogueEditorComponent
      )
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
