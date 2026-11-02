import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/pages/auth.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent
  },

  {
    path: 'adventures',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/adventures/pages/adventure-list/adventure-list.component').then(
        (m) => m.AdventureListComponent
      )
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
    path: 'adventures/my',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/adventures/pages/my-adventures/my-adventures.component').then(
        (m) => m.MyAdventuresComponent
      )
  },

  {
    path: 'adventures/:adventureId/scenes/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/scene-editor/components/scene-create/scene-create.component'
        ).then((m) => m.SceneCreateComponent)
  },

  {
    path: 'adventures/:adventureCode/play',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/gameplay/gameplay.component').then(
        (m) => m.GameplayComponent
      )
  },

  {
    path: 'editor/:adventureId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/scene-editor/scene-editor.component').then(
        (m) => m.SceneEditorComponent
      )
  },

  {
    path: 'editor/:adventureId/:sceneCode',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/scene-editor/scene-editor.component').then(
        (m) => m.SceneEditorComponent
      )
  },

  {
    path: 'adventures/:adventureId/items/:itemId/dialogues',
    loadComponent: () =>
      import('./features/dialogue-editor/dialogue-editor.component').then(
        (m) => m.DialogueEditorComponent
      )
  },

  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'auth'
  }
];
