import { Component, inject } from '@angular/core';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { nodeLabel } from '../../../../core/utils/node-label';
import { DialogueNode } from '../../../../core/models';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
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
  private readonly confirm = inject(ConfirmService);
  readonly nodeLabel = (node: DialogueNode) => nodeLabel(node, this.i18n);

  async onRemove(event: Event, code: string): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.confirm.ask({
      title: this.i18n.t('confirmation.deleteTitle'),
      message: this.i18n.t('dialogueEditor.confirmDeleteNode'),
      confirmText: this.i18n.t('common.delete')
    });
    if (confirmed) {
      this.store.removeNode(code);
    }
  }
}
