import { Location } from '@angular/common';
import {Component, OnInit, computed, inject, HostListener} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditorStore } from '../scene-editor/store/editor.store';
import { DialogueEditorStore } from './store/dialogue-editor.store';
import { DialogueNodeListComponent } from './components/dialogue-node-list/dialogue-node-list.component';
import { DialogueNodeFormComponent } from './components/dialogue-node-form/dialogue-node-form.component';
import { DialogueChoicesPanelComponent } from './components/dialogue-choices-panel/dialogue-choices-panel.component';
import { TranslationService } from '../../core/i18n/translation.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dialogue-editor',
  standalone: true,
  imports: [DialogueNodeListComponent, DialogueNodeFormComponent, DialogueChoicesPanelComponent, TranslatePipe],
  providers: [DialogueEditorStore],
  templateUrl: './dialogue-editor.component.html',
  styleUrl: './dialogue-editor.component.css'
})
export class DialogueEditorComponent implements OnInit {

  private readonly i18n = inject(TranslationService);
  private readonly confirm = inject(ConfirmService);

  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly editorStore = inject(EditorStore);
  readonly store = inject(DialogueEditorStore);

  readonly item = computed(() => {
    const itemId = this.store.itemId();
    return itemId ? this.editorStore.findItemEverywhere(itemId) : undefined;
  });

  ngOnInit(): void {
    const itemId = Number(this.route.snapshot.paramMap.get('itemId'));
    const adventureId = Number(this.route.snapshot.paramMap.get('adventureId'));

    if (!itemId) {
      return;
    }

    this.store.load(itemId);

    if (adventureId && this.editorStore.adventure()?.id !== adventureId) {
      this.editorStore.loadAdventureAndScenes({ adventureId });
    }
  }

  save(): void {
    this.store.save().subscribe({ error: () => undefined });
  }

  async goBack(): Promise<void> {
    if (this.store.isDirty()) {
      const confirmed = await this.confirm.ask({
        title: this.i18n.t('dialogueEditor.leaveTitle'),
        message: this.i18n.t('dialogueEditor.confirmLeave'),
        confirmText: this.i18n.t('dialogueEditor.leaveConfirm')
      });
      if (!confirmed) {
        return;
      }
    }

    const code = this.item()?.code;
    if (code) {
      sessionStorage.setItem('pending_selected_item', code);
    }
    this.location.back();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.store.isDirty()) {
      event.preventDefault();
    }
  }
}
