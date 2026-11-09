import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { GameEffect } from '../../../../core/models';
import { EffectsEditorComponent } from '../effects-editor/effects-editor.component';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dialogue-node-form',
  standalone: true,
  imports: [FormsModule, EffectsEditorComponent, TranslatePipe],
  templateUrl: './dialogue-node-form.component.html',
  styleUrl: './dialogue-node-form.component.css'
})
export class DialogueNodeFormComponent {
  readonly store = inject(DialogueEditorStore);

  onNodeText(nodeCode: string, text: string): void {
    this.store.updateNode(nodeCode, { text });
  }

  onNodeEffects(nodeCode: string, effects: GameEffect[]): void {
    this.store.updateNode(nodeCode, { effects });
  }
}
