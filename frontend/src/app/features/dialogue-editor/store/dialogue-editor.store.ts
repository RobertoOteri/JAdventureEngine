import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, Observable, pipe, switchMap, tap } from 'rxjs';
import { DialogueChoice, DialogueNode } from '../../../core/models';
import { DialogueService } from '../../../core/services/dialogue.service';
import { sanitizeNodes } from '../../../core/utils/sanitize-nodes';

export interface DialogueEditorState {
  itemId: number | null;
  nodes: DialogueNode[];
  selectedNodeCode: string | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  feedbackMessage: string | null;
}

const initialState: DialogueEditorState = {
  itemId: null,
  nodes: [],
  selectedNodeCode: null,
  isLoading: false,
  isSaving: false,
  isDirty: false,
  feedbackMessage: null
};

export const DialogueEditorStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    selectedNode: computed(
      () => store.nodes().find((n) => n.code === store.selectedNodeCode()) ?? null
    )
  })),

  withMethods((store, dialogueService = inject(DialogueService)) => {
    const patchNodes = (update: (nodes: DialogueNode[]) => DialogueNode[]): void => {
      patchState(store, { nodes: update(store.nodes()), isDirty: true, feedbackMessage: null });
    };

    const patchNode = (code: string, update: (node: DialogueNode) => DialogueNode): void => {
      patchNodes((nodes) => nodes.map((n) => (n.code === code ? update(n) : n)));
    };

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
                console.error('Errore caricamento dialoghi:', err);
                patchState(store, {
                  isLoading: false,
                  feedbackMessage: 'Impossibile caricare i dialoghi.'
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

      removeNode(code: string): void {
        // le scelte che puntavano al nodo eliminato diventano "fine dialogo"
        patchNodes((nodes) =>
          nodes
            .filter((n) => n.code !== code)
            .map((n) => ({
              ...n,
              choices: n.choices.map((c) =>
                c.nextNodeCode === code ? { ...c, nextNodeCode: null } : c
              )
            }))
        );
        if (store.selectedNodeCode() === code) {
          patchState(store, { selectedNodeCode: store.nodes()[0]?.code ?? null });
        }
      },

      addChoice(nodeCode: string): void {
        const choice: DialogueChoice = { text: '', nextNodeCode: null, preconditions: [], effects: [] };
        patchNode(nodeCode, (n) => ({ ...n, choices: [...n.choices, choice] }));
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

      save(): Observable<DialogueNode[]> {
        const itemId = store.itemId();
        if (!itemId) {
          throw new Error('Nessun oggetto selezionato.');
        }

        patchState(store, { isSaving: true, feedbackMessage: null });

        return dialogueService.saveAll(itemId, sanitizeNodes(store.nodes())).pipe(
          tap({
            next: (nodes) =>
              patchState(store, {
                nodes,
                isDirty: false,
                isSaving: false,
                feedbackMessage: 'Dialoghi salvati!'
              }),
            error: (err: any) => {
              console.error('Errore salvataggio dialoghi:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore salvataggio dialoghi.'
              });
            }
          })
        );
      }
    };
  })
);
