import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { GraphicAdventureDto, Scene } from '../../../../core/models';
import { FileDropzoneComponent } from '../../../../shared/ui/file-dropzone/file-dropzone.component';

@Component({
  selector: 'app-adventure-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileDropzoneComponent],
  templateUrl: './adventure-create.component.html',
  styleUrl: './adventure-create.component.css',
  host: {
    '[class.is-modal-host]': 'isModal()',
    '[class.is-page-host]': '!isModal()'
  }
})
export class AdventureCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);

  readonly isModal = input<boolean>(false);
  readonly initialAdventure = input<GraphicAdventureDto | null>(null);
  readonly scenes = input<Scene[]>([]);

  readonly closeRequested = output<void>();
  readonly saved = output<FormData>();

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(2000)]],
    initialSceneCode: ['']
  });

  private selectedFile: File | null = null;
  readonly existingCoverUrl = signal<string | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const init = this.initialAdventure();
      if (init) {
        this.form.patchValue({
          title: init.title,
          description: init.description || '',
          initialSceneCode: init.initialSceneCode || ''
        });
        this.existingCoverUrl.set(init.coverImageUrl || null);
      }
    });
  }

  onFileChange(file: File | null): void {
    this.selectedFile = file;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const init = this.initialAdventure();
    const formData = new FormData();

    const adventurePayload: any = {
      title: this.form.value.title?.trim(),
      description: this.form.value.description?.trim() || null
    };

    if (init?.id) {
      adventurePayload.id = init.id;
      adventurePayload.code = init.code;
      adventurePayload.initialSceneCode = this.form.value.initialSceneCode || null;
    }

    formData.append(
      'data',
      new Blob([JSON.stringify(adventurePayload)], { type: 'application/json' })
    );

    if (this.selectedFile) {
      formData.append('coverImage', this.selectedFile);
    }

    if (this.isModal()) {
      this.saved.emit(formData);
      return;
    }

    this.adventureService.createAdventure(formData).subscribe({
      next: (createdAdventure: GraphicAdventureDto) => {
        this.isSubmitting.set(false);
        const sceneTarget = createdAdventure.initialSceneCode || 'new';
        void this.router.navigate(['/editor', createdAdventure.id, sceneTarget]);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.error?.detail || "Errore durante il salvataggio dell'avventura."
        );
      }
    });
  }

  onCancel(): void {
    if (this.isModal()) {
      this.closeRequested.emit();
    } else {
      void this.router.navigate(['/adventures/my']);
    }
  }
}
