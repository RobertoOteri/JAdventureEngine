import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SceneService } from '../../../../core/services/scene.service';
import { AdventureService } from '../../../../core/services/adventure.service';
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
  private readonly adventureService = inject(AdventureService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly adventureId = signal<number | null>(null);
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
    const idParam = this.route.snapshot.paramMap.get('adventureId');
    const advId = idParam ? Number(idParam) : null;
    this.adventureId.set(advId);

    const isInitialParam = this.route.snapshot.queryParamMap.get('isInitial');

    if (advId) {
      this.adventureService.getAdventureById(advId).subscribe({
        next: (adv) => {
          this.adventureCode.set(adv.code);

          if (isInitialParam !== null) {
            this.applyInitialState(isInitialParam === 'true');
          } else {
            this.sceneService.getAllScenes(adv.code).subscribe({
              next: (scenes) => {
                const isFirstScene = scenes.length === 0;
                this.applyInitialState(isFirstScene);
              },
              error: () => this.applyInitialState(false)
            });
          }
        },
        error: (err) => {
          console.error('Errore nel caricamento dei dati avventura:', err);
          this.errorMessage.set('Impossibile caricare i dati dell\'avventura.');
        }
      });
    }

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
    const advId = this.adventureId();

    if (this.form.invalid || !file) {
      this.form.markAllAsTouched();
      if (!file) {
        this.errorMessage.set('Lo sfondo della stanza è obbligatorio.');
      }
      return;
    }

    if (!advId) {
      this.errorMessage.set("Identificativo dell'avventura non disponibile. Riprova.");
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();

    const scenePayload = {
      name: this.form.value.name?.trim(),
      code: this.form.value.code?.trim(),
      setAsInitial: this.form.value.setAsInitial
    };

    formData.append(
      'data',
      new Blob([JSON.stringify(scenePayload)], { type: 'application/json' })
    );

    formData.append('backgroundImage', file);

    this.adventureService.addScene(advId, formData).subscribe({
      next: (createdScene: Scene) => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/editor', advId, createdScene.code]);
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
    const advId = this.adventureId();
    if (advId) {
      void this.router.navigate(['/editor', advId]);
    } else {
      void this.router.navigate(['/adventures/my']);
    }
  }
}
