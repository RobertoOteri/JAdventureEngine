import { Location } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditorStore } from '../scene-editor/store/editor.store';
import { DialogueEditorStore } from './store/dialogue-editor.store';
import { DialogueNodeListComponent } from './components/dialogue-node-list/dialogue-node-list.component';
import { DialogueNodeFormComponent } from './components/dialogue-node-form/dialogue-node-form.component';

@Component({
  selector: 'app-dialogue-editor',
  standalone: true,
  imports: [DialogueNodeListComponent, DialogueNodeFormComponent],
  providers: [DialogueEditorStore],
  templateUrl: './dialogue-editor.component.html',
  styleUrl: './dialogue-editor.component.css'
})
export class DialogueEditorComponent implements OnInit {
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

    // Se la pagina viene aperta direttamente (refresh) lo store dell'editor è vuoto
    if (adventureId && this.editorStore.adventure()?.id !== adventureId) {
      this.editorStore.loadAdventureAndScenes({ adventureId });
    }
  }

  save(): void {
    this.store.save().subscribe({ error: () => undefined }); // il feedback è già nello store
  }

  goBack(): void {
    if (this.store.isDirty() && !confirm('Hai modifiche non salvate. Uscire comunque?')) {
      return;
    }

    const code = this.item()?.code;
    if (code) {
      sessionStorage.setItem('pending_selected_item', code);
    }
    this.location.back();
  }
}
