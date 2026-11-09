import { Component, inject } from '@angular/core';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { nodeLabel } from '../../../../core/utils/node-label';
import { DialogueNode } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dialogue-node-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './dialogue-node-list.component.html',
  styleUrl: './dialogue-node-list.component.css'
})
export class DialogueNodeListComponent {
  readonly store = inject(DialogueEditorStore);
  private readonly i18n = inject(TranslationService);
  readonly nodeLabel = (node: DialogueNode) => nodeLabel(node, this.i18n);

  onRemove(event: Event, code: string): void {
    event.stopPropagation();
    if (confirm(this.i18n.t('dialogueEditor.confirmDeleteNode'))) {
      this.store.removeNode(code);
    }
  }
}
