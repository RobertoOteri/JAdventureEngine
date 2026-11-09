import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogueEditorStore } from '../../store/dialogue-editor.store';
import { nodeLabel } from '../../../../core/utils/node-label';
import { DialogueChoice, GameEffect, Precondition, DialogueNode } from '../../../../core/models';
import { EffectsEditorComponent } from '../effects-editor/effects-editor.component';
import { PreconditionsEditorComponent } from '../preconditions-editor/preconditions-editor.component';
import { TranslationService } from '../../../../core/i18n/translation.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dialogue-choices-panel',
  standalone: true,
  imports: [FormsModule, EffectsEditorComponent, PreconditionsEditorComponent, TranslatePipe],
  templateUrl: './dialogue-choices-panel.component.html',
  styleUrl: './dialogue-choices-panel.component.css'
})
export class DialogueChoicesPanelComponent {

  readonly store = inject(DialogueEditorStore);
  private readonly i18n = inject(TranslationService);
  readonly nodeLabel = (node: DialogueNode) => nodeLabel(node, this.i18n);

  readonly END_VALUE = '__END__';

  readonly expandedChoice = signal<number | null>(null);

  constructor() {
    effect(() => {
      this.store.selectedNodeCode();
      untracked(() => this.expandedChoice.set(null));
    });
  }

  endsDialogue(choice: DialogueChoice): boolean {
    return choice.effects.some((e) => e.type === 'END_DIALOGUE');
  }

  targetValue(choice: DialogueChoice): string | null {
    return this.endsDialogue(choice) ? this.END_VALUE : (choice.nextNodeCode ?? null);
  }

  targetLabel(choice: DialogueChoice): string {
    if (this.endsDialogue(choice)) return this.i18n.t('dialogueEditor.endDialogue');
    if (!choice.nextNodeCode) return this.i18n.t('dialogueEditor.missingTarget');
    const target = this.store.nodes().find((n) => n.code === choice.nextNodeCode);
    return target ? this.nodeLabel(target) : this.i18n.t('dialogueEditor.deletedNode');
  }

  effectsCount(choice: DialogueChoice): number {
    return choice.effects.filter((e) => e.type !== 'END_DIALOGUE').length;
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

  onChoiceTarget(nodeCode: string, index: number, value: string | null): void {
    this.store.setChoiceTarget(nodeCode, index, value === this.END_VALUE ? null : value);
  }

  onChoicePreconditions(nodeCode: string, index: number, preconditions: Precondition[]): void {
    this.store.updateChoice(nodeCode, index, { preconditions });
  }

  onChoiceEffects(nodeCode: string, index: number, effects: GameEffect[]): void {
    this.store.updateChoice(nodeCode, index, { effects });
  }
}
