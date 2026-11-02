import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { nodeLabel } from '../../../../core/utils/node-label';

@Component({
  selector: 'app-dialogue-node-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dialogue-node-form.component.html',
  styleUrl: './dialogue-node-form.component.css'
})
export class DialogueNodeFormComponent {
  readonly store = inject(DialogueEditorStore);
  readonly nodeLabel = nodeLabel;

  onNodeText(nodeCode: string, text: string): void {
    this.store.updateNode(nodeCode, { text });
  }

  onChoiceText(nodeCode: string, index: number, text: string): void {
    this.store.updateChoice(nodeCode, index, { text });
  }

  onChoiceTarget(nodeCode: string, index: number, nextNodeCode: string | null): void {
    this.store.updateChoice(nodeCode, index, { nextNodeCode });
  }
}
