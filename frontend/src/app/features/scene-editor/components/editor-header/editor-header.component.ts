import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditorStore } from '../../store/editor.store';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import {apiErrorMessage} from '../../../../core/utils/http-error.util';

@Component({
  selector: 'app-editor-header',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent, TranslatePipe],
  templateUrl: './editor-header.component.html',
  styleUrl: './editor-header.component.css'
})
export class EditorHeaderComponent {
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  readonly store = inject(EditorStore);

  readonly draftPointsCount = input<number>(0);

  readonly undoPoint = output<void>();
  readonly editAdventureRequested = output<void>();

  readonly isPublishConfirmOpen = signal<boolean>(false);
  readonly publishError = signal<string | null>(null);

  goBackToAdventures(): void {
    this.router.navigate(['/adventures/my']);
  }

  confirmPublish(): void {
    this.isPublishConfirmOpen.set(false);
    this.publishError.set(null);

    const currentSceneCode = this.store.currentScene()?.code;

    this.store.publishDraft().subscribe({
      next: (newDraft) => {
        const target = currentSceneCode
          ? ['/editor', newDraft.id, currentSceneCode]
          : ['/editor', newDraft.id];
        void this.router.navigate(target);
      },
      error: (err: any) =>
        this.publishError.set(apiErrorMessage(err, this.i18n) || this.i18n.t('sceneEditor.header.publishError'))    });
  }
}
