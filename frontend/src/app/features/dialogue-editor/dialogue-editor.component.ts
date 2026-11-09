import { Location } from '@angular/common';
import {Component, OnInit, computed, inject, HostListener} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditorStore } from '../scene-editor/store/editor.store';
import { DialogueEditorStore } from './store/dialogue-editor.store';
import { DialogueNodeListComponent } from './components/dialogue-node-list/dialogue-node-list.component';
import { DialogueNodeFormComponent } from './components/dialogue-node-form/dialogue-node-form.component';
import { DialogueChoicesPanelComponent } from './components/dialogue-choices-panel/dialogue-choices-panel.component';
import { TranslationService } from '../../core/i18n/translation.service';
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

  goBack(): void {
    if (this.store.isDirty() && !confirm(this.i18n.t('dialogueEditor.confirmLeave'))) {
      return;
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
