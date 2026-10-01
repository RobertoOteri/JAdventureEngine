import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdventureService } from '../../../../core/services/adventure.service';
import { GraphicAdventureResponse } from '../../../../core/models';
import { FileDropzoneComponent } from '../../../../shared/ui/file-dropzone/file-dropzone.component';

@Component({
  selector: 'app-adventure-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileDropzoneComponent],
  templateUrl: './adventure-create.component.html',
  styleUrl: './adventure-create.component.css'
})
export class AdventureCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(2000)]]
  });

  private selectedFile: File | null = null;

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

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

    const formData = new FormData();
    const adventurePayload = {
      title: this.form.value.title?.trim(),
      description: this.form.value.description?.trim() || null
    };

    formData.append(
      'data',
      new Blob([JSON.stringify(adventurePayload)], { type: 'application/json' })
    );

    if (this.selectedFile) {
      formData.append('coverImage', this.selectedFile);
    }

    this.adventureService.createAdventure(formData).subscribe({
      next: (createdAdventure: GraphicAdventureResponse) => {
        this.isSubmitting.set(false);
        const sceneTarget = createdAdventure.initialSceneCode || 'new';
        this.router.navigate(['/editor', createdAdventure.code, sceneTarget]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || err.error?.detail || "Errore durante il salvataggio dell'avventura."
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/adventures/my']);
  }
}
