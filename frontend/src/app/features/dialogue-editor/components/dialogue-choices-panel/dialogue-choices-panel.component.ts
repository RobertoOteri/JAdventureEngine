import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { nodeLabel } from '../../../../core/utils/node-label';
import { GameEffect, Precondition } from '../../../../core/models';
import { EffectsEditorComponent } from '../effects-editor/effects-editor.component';
import { PreconditionsEditorComponent } from '../preconditions-editor/preconditions-editor.component';

@Component({
  selector: 'app-dialogue-choices-panel',
  standalone: true,
  imports: [FormsModule, EffectsEditorComponent, PreconditionsEditorComponent],
  templateUrl: './dialogue-choices-panel.component.html',
  styleUrl: './dialogue-choices-panel.component.css'
})
export class DialogueChoicesPanelComponent {
  readonly store = inject(DialogueEditorStore);
  readonly nodeLabel = nodeLabel;

  /** indice della scelta aperta nell'accordion (una alla volta) */
  readonly expandedChoice = signal<number | null>(null);

  constructor() {
    // cambiando nodo, l'accordion riparte chiuso
    effect(() => {
      this.store.selectedNodeCode();
      untracked(() => this.expandedChoice.set(null));
    });
  }

  targetLabel(code: string | null | undefined): string {
    if (!code) {
      return 'Fine dialogo';
    }
    const target = this.store.nodes().find((n) => n.code === code);
    return target ? nodeLabel(target) : 'Nodo eliminato';
  }

  toggleChoice(index: number): void {
    this.expandedChoice.update((current) => (current === index ? null : index));
  }

  addChoice(nodeCode: string, currentCount: number): void {
    this.store.addChoice(nodeCode);
    this.expandedChoice.set(currentCount);
  }

  removeChoice(nodeCode: string, index: number): void {
    this.store.removeChoice(nodeCode, index);
    const open = this.expandedChoice();
    if (open === null) return;
    if (open === index) this.expandedChoice.set(null);
    else if (open > index) this.expandedChoice.set(open - 1);
  }

  onChoiceText(nodeCode: string, index: number, text: string): void {
    this.store.updateChoice(nodeCode, index, { text });
  }

  onChoiceTarget(nodeCode: string, index: number, nextNodeCode: string | null): void {
    this.store.updateChoice(nodeCode, index, { nextNodeCode });
  }

  onChoicePreconditions(nodeCode: string, index: number, preconditions: Precondition[]): void {
    this.store.updateChoice(nodeCode, index, { preconditions });
  }

  onChoiceEffects(nodeCode: string, index: number, effects: GameEffect[]): void {
    this.store.updateChoice(nodeCode, index, { effects });
  }
}
