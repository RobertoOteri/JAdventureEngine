import { Component, inject } from '@angular/core';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { nodeLabel } from '../../../../core/utils/node-label';

@Component({
  selector: 'app-dialogue-node-list',
  standalone: true,
  templateUrl: './dialogue-node-list.component.html',
  styleUrl: './dialogue-node-list.component.css'
})
export class DialogueNodeListComponent {
  readonly store = inject(DialogueEditorStore);
  readonly nodeLabel = nodeLabel;

  onRemove(event: Event, code: string): void {
    event.stopPropagation();
    if (confirm('Eliminare questo nodo? Le scelte che portavano qui chiuderanno il dialogo.')) {
      this.store.removeNode(code);
    }
  }
}
