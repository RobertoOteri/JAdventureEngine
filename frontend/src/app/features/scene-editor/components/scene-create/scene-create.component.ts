import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SceneService } from '../../../../core/services/scene.service';
import { Scene } from '../../../../core/models';
import { FileDropzoneComponent } from '../../../../shared/ui/file-dropzone/file-dropzone.component';

@Component({
  selector: 'app-scene-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileDropzoneComponent],
  templateUrl: './scene-create.component.html',
  styleUrl: './scene-create.component.css'
})
export class SceneCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sceneService = inject(SceneService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly adventureCode = signal<string>('');
  readonly isInitialScene = signal<boolean>(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-z0-9_]+$/)]],
    setAsInitial: [false]
  });

  readonly selectedFile = signal<File | null>(null);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('adventureCode') || '';
    this.adventureCode.set(code);

    const isInitialParam = this.route.snapshot.queryParamMap.get('isInitial');

    if (isInitialParam !== null) {
      this.applyInitialState(isInitialParam === 'true');
    } else if (code) {
      this.sceneService.getAllScenes(code).subscribe({
        next: (scenes) => {
          const isFirstScene = scenes.length === 0;
          this.applyInitialState(isFirstScene);
        },
        error: () => {
          this.applyInitialState(false);
        }
      });
    }

    // Generazione automatica reattiva del codice/slug dal nome
    this.form.get('name')?.valueChanges.subscribe((nameVal) => {
      if (this.isInitialScene() || !nameVal) {
        return;
      }
      const slug = nameVal
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_');
      this.form.patchValue({ code: slug }, { emitEvent: false });
    });
  }

  private applyInitialState(isInitial: boolean): void {
    this.isInitialScene.set(isInitial);
    if (isInitial) {
      this.form.patchValue({
        code: 'start',
        setAsInitial: true
      });
    } else {
      this.form.patchValue({
        code: '',
        setAsInitial: false
      });
    }
  }

  onFileChange(file: File | null): void {
    this.selectedFile.set(file);
    if (file) {
      this.errorMessage.set(null);
    }
  }

  onSubmit(): void {
    const file = this.selectedFile();
    if (this.form.invalid || !file) {
      this.form.markAllAsTouched();
      if (!file) {
        this.errorMessage.set('Lo sfondo della stanza è obbligatorio.');
      }
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    const payload = {
      name: this.form.value.name?.trim(),
      code: this.form.value.code?.trim(),
      setAsInitial: this.form.value.setAsInitial
    };

    formData.append(
      'data',
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );
    formData.append('backgroundImage', file);

    this.sceneService.createScene(this.adventureCode(), formData).subscribe({
      next: (createdScene: Scene) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/editor', this.adventureCode(), createdScene.code]);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err?.error?.message || err?.error?.detail || 'Errore nel salvataggio della stanza.'
        );
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/editor', this.adventureCode()]);
  }
}
