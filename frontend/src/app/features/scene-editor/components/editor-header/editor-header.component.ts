import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EditorStore } from '../../store/editor.store';
import { ConfirmationModalComponent } from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-editor-header',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent, TranslatePipe],
  templateUrl: './editor-header.component.html',
  styleUrl: './editor-header.component.css'
})
export class EditorHeaderComponent {
  private readonly i18n = inject(TranslationService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  readonly store = inject(EditorStore);


  readonly editAdventureRequested = output<void>();

  readonly isPublishConfirmOpen = signal<boolean>(false);

  goBackToAdventures(): void {
    this.router.navigate(['/adventures/my']);
  }

  confirmPublish(): void {
    this.isPublishConfirmOpen.set(false);

    const currentSceneCode = this.store.currentScene()?.code;

    this.store.publishDraft().subscribe({
      next: (newDraft) => {
        const target = currentSceneCode
          ? ['/editor', newDraft.id, currentSceneCode]
          : ['/editor', newDraft.id];
        this.notifications.success(this.i18n.t('sceneEditor.header.publishSuccess'));
        void this.router.navigate(target);
      },
      error: () => undefined
    });
  }
}
