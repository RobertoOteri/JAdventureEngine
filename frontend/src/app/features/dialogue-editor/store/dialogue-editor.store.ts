import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, Observable, pipe, switchMap, tap } from 'rxjs';
import { DialogueChoice, DialogueNode, GameEffect } from '../../../core/models';
import { DialogueService } from '../../../core/services/dialogue.service';
import { sanitizeNodes } from '../../../core/utils/sanitize-nodes';
import { TranslationService } from '../../../core/i18n/translation.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface DialogueEditorState {
  itemId: number | null;
  nodes: DialogueNode[];
  selectedNodeCode: string | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
}

const initialState: DialogueEditorState = {
  itemId: null,
  nodes: [],
  selectedNodeCode: null,
  isLoading: false,
  isSaving: false,
  isDirty: false
};

export const DialogueEditorStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    selectedNode: computed(
      () => store.nodes().find((n) => n.code === store.selectedNodeCode()) ?? null
    )
  })),

  withMethods((
    store,
    dialogueService = inject(DialogueService),
    i18n = inject(TranslationService),
    notifications = inject(NotificationService)
  ) => {
    const patchNodes = (update: (nodes: DialogueNode[]) => DialogueNode[]): void => {
      patchState(store, { nodes: update(store.nodes()), isDirty: true });
    };

    const patchNode = (code: string, update: (node: DialogueNode) => DialogueNode): void => {
      patchNodes((nodes) => nodes.map((n) => (n.code === code ? update(n) : n)));
    };

    const endEffect = (): GameEffect => ({ type: 'END_DIALOGUE' });
    const withoutEnd = (effects: GameEffect[]): GameEffect[] =>
      effects.filter((e) => e.type !== 'END_DIALOGUE');

    return {
      load: rxMethod<number>(
        pipe(
          tap((itemId) => patchState(store, { ...initialState, itemId, isLoading: true })),
          switchMap((itemId) =>
            dialogueService.findByItem(itemId).pipe(
              tap((nodes) =>
                patchState(store, {
                  nodes,
                  selectedNodeCode: nodes[0]?.code ?? null,
                  isLoading: false
                })
              ),
              catchError((err) => {
                notifications.httpError(err, 'dialogueEditor.feedback.loadError');
                patchState(store, {
                  isLoading: false
                });
                return EMPTY;
              })
            )
          )
        )
      ),

      selectNode(code: string | null): void {
        patchState(store, { selectedNodeCode: code });
      },

      addNode(): void {
        const node: DialogueNode = { code: crypto.randomUUID(), text: '', choices: [], effects: [] };
        patchNodes((nodes) => [...nodes, node]);
        patchState(store, { selectedNodeCode: node.code });
      },

      updateNode(code: string, patch: Partial<Pick<DialogueNode, 'text' | 'effects'>>): void {
        patchNode(code, (n) => ({ ...n, ...patch }));
      },

      updateChoice(nodeCode: string, index: number, patch: Partial<DialogueChoice>): void {
        patchNode(nodeCode, (n) => ({
          ...n,
          choices: n.choices.map((c, i) => (i === index ? { ...c, ...patch } : c))
        }));
      },

      removeChoice(nodeCode: string, index: number): void {
        patchNode(nodeCode, (n) => ({
          ...n,
          choices: n.choices.filter((_, i) => i !== index)
        }));
      },

      removeNode(code: string): void {
        patchNodes((nodes) =>
          nodes
            .filter((n) => n.code !== code)
            .map((n) => ({
              ...n,
              choices: n.choices.map((c) =>
                c.nextNodeCode === code
                  ? { ...c, nextNodeCode: null, effects: [...withoutEnd(c.effects), endEffect()] }
                  : c
              )
            }))
        );
        if (store.selectedNodeCode() === code) {
          patchState(store, { selectedNodeCode: store.nodes()[0]?.code ?? null });
        }
      },

      addChoice(nodeCode: string): void {
        const choice: DialogueChoice = {
          text: '',
          nextNodeCode: null,
          preconditions: [],
          effects: [endEffect()]
        };
        patchNode(nodeCode, (n) => ({ ...n, choices: [...n.choices, choice] }));
      },

      setChoiceTarget(nodeCode: string, index: number, nextNodeCode: string | null): void {
        patchNode(nodeCode, (n) => ({
          ...n,
          choices: n.choices.map((c, i) => {
            if (i !== index) return c;
            const effects = withoutEnd(c.effects);
            return nextNodeCode
              ? { ...c, nextNodeCode, effects }
              : { ...c, nextNodeCode: null, effects: [...effects, endEffect()] };
          })
        }));
      },

      save(): Observable<DialogueNode[]> {
        const itemId = store.itemId();
        if (!itemId) {
          throw new Error('Nessun oggetto selezionato.');
        }

        patchState(store, { isSaving: true });

        return dialogueService.saveAll(itemId, sanitizeNodes(store.nodes())).pipe(
          tap({
            next: (nodes) => {
              notifications.success(i18n.t('dialogueEditor.feedback.saved'));
              patchState(store, {
                nodes,
                isDirty: false,
                isSaving: false
              });
            },
            error: (err: any) => {
              notifications.httpError(err, 'dialogueEditor.feedback.saveError');
              patchState(store, {
                isSaving: false
              });
            }
          })
        );
      }
    };
  })
);
