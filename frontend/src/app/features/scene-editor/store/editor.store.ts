import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, of, pipe, switchMap, tap } from 'rxjs';
import { Action, GraphicAdventureDto, InventoryItem, Item, Scene } from '../../../core/models';
import { AdventureService } from '../../../core/services/adventure.service';
import { SceneService } from '../../../core/services/scene.service';
import { ItemService } from '../../../core/services/item.service';
import { ActionService } from '../../../core/services/action.service';
import { InventoryItemService } from '../../../core/services/inventory-item.service';

export interface EditorState {
  adventure: GraphicAdventureDto | null;
  scenes: Scene[];
  currentScene: Scene | null;
  selectedItem: Item | null;
  isLoading: boolean;
  isSaving: boolean;
  feedbackMessage: string | null;
}

const initialState: EditorState = {
  adventure: null,
  scenes: [],
  currentScene: null,
  selectedItem: null,
  isLoading: false,
  isSaving: false,
  feedbackMessage: null
};

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    adventureTitle: computed(() => store.adventure()?.title ?? ''),
    itemsCount: computed(() => store.currentScene()?.items?.length ?? 0),
    backgroundUrl: computed(() => store.currentScene()?.backgroundImageUrl ?? '')
  })),

  withMethods((
    store,
    adventureService = inject(AdventureService),
    sceneService = inject(SceneService),
    itemService = inject(ItemService),
    actionService = inject(ActionService),
    inventoryItemService = inject(InventoryItemService)
  ) => {

    const resetState = (): void => {
      patchState(store, {
        adventure: null,
        scenes: [],
        currentScene: null,
        selectedItem: null,
        isLoading: false,
        isSaving: false,
        feedbackMessage: null
      });
    };

    const normalizeScene = (scene: Scene): Scene => ({
      ...scene,
      items: scene.items ?? []
    });

    const updateItemInState = (updatedItem: Item): void => {
      const scene = store.currentScene();
      if (!scene) return;

      const items = scene.items ?? [];
      const index = items.findIndex((i) => (updatedItem.id && i.id === updatedItem.id) || i.code === updatedItem.code);
      const updatedItems = index >= 0
        ? items.map((i, idx) => (idx === index ? updatedItem : i))
        : [...items, updatedItem];

      const updatedCurrentScene: Scene = { ...scene, items: updatedItems };

      const updatedScenes = store.scenes().map((s) =>
        s.id === updatedCurrentScene.id || s.code === updatedCurrentScene.code ? updatedCurrentScene : s
      );

      patchState(store, {
        scenes: updatedScenes,
        currentScene: updatedCurrentScene,
        selectedItem: updatedItem
      });
    };

    const loadAdventureAndScenes = rxMethod<{
      adventureId?: number;
      adventureCode?: string;
      sceneId?: number;
      sceneCode?: string;
    }>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            feedbackMessage: null,
            adventure: null,
            scenes: [],
            currentScene: null,
            selectedItem: null
          })
        ),
        switchMap(({ adventureId, adventureCode, sceneId, sceneCode }) => {
          let adventure$: Observable<GraphicAdventureDto>;

          if (adventureId && !isNaN(adventureId)) {
            adventure$ = adventureService.getAdventureById(adventureId);
          } else if (adventureCode) {
            adventure$ = adventureService.getAllAdventures().pipe(
              switchMap((adventures) => {
                const found = adventures.find((a) => a.code.toLowerCase() === adventureCode.toLowerCase());
                if (!found) {
                  throw new Error(`Avventura non trovata con codice: ${adventureCode}`);
                }
                return of(found);
              })
            );
          } else {
            patchState(store, {
              isLoading: false,
              feedbackMessage: 'Identificativo avventura non valido.'
            });
            return of(null);
          }

          return adventure$.pipe(
            switchMap((adventure) =>
              sceneService.getScenes(adventure.code).pipe(
                tap({
                  next: (rawScenes) => {
                    const scenes = (rawScenes ?? []).map(normalizeScene);
                    let active: Scene | null = null;

                    if (sceneId) {
                      active = scenes.find((s) => s.id === sceneId) || null;
                    } else if (sceneCode && sceneCode !== 'new') {
                      active = scenes.find((s) => s.code === sceneCode) || null;
                    } else {
                      active = scenes.find((s) => s.code === adventure.initialSceneCode) || scenes[0] || null;
                    }

                    patchState(store, {
                      adventure,
                      scenes,
                      currentScene: active,
                      selectedItem: null,
                      isLoading: false
                    });
                  },
                  error: (err: any) => {
                    console.error('Errore caricamento scene:', err);
                    patchState(store, {
                      isLoading: false,
                      feedbackMessage: 'Impossibile caricare i dati delle scene.'
                    });
                  }
                })
              )
            ),
            tap({
              error: (err: any) => {
                console.error('Errore caricamento avventura:', err);
                patchState(store, {
                  isLoading: false,
                  feedbackMessage: "Impossibile caricare l'avventura richiesta."
                });
              }
            })
          );
        })
      )
    );

    return {
      resetState,
      loadAdventureAndScenes,

      createScene(formData: FormData): Observable<Scene> {
        const adventureId = store.adventure()?.id;
        if (!adventureId) {
          throw new Error('Nessuna avventura caricata.');
        }

        patchState(store, { isSaving: true, feedbackMessage: null });

        return adventureService.addScene(adventureId, formData).pipe(
          tap({
            next: (createdScene) => {
              const normalized = normalizeScene(createdScene);
              const updatedScenes = [...store.scenes(), normalized];
              patchState(store, {
                scenes: updatedScenes,
                currentScene: normalized,
                selectedItem: null,
                isSaving: false,
                feedbackMessage: `Scena "${normalized.name}" creata con successo!`
              });
            },
            error: (err: any) => {
              console.error('Errore creazione scena:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore durante la creazione della scena.'
              });
            }
          })
        );
      },

      deleteScene(sceneId: number): Observable<void> {
        patchState(store, { isSaving: true });

        return sceneService.deleteScene(sceneId).pipe(
          tap({
            next: () => {
              const updatedScenes = store.scenes().filter((s) => s.id !== sceneId);
              const isCurrent = store.currentScene()?.id === sceneId;
              const nextCurrent = isCurrent ? (updatedScenes[0] || null) : store.currentScene();

              patchState(store, {
                scenes: updatedScenes,
                currentScene: nextCurrent,
                selectedItem: isCurrent ? null : store.selectedItem(),
                isSaving: false
              });
            },
            error: (err: any) => {
              console.error('Errore eliminazione scena:', err);
              patchState(store, { isSaving: false });
            }
          })
        );
      },

      selectItem(item: Item | null): void {
        patchState(store, { selectedItem: item });
      },

      updateAdventureDetails(formData: FormData): Observable<GraphicAdventureDto> {
        patchState(store, { isSaving: true, feedbackMessage: null });

        return adventureService.updateAdventure(formData).pipe(
          tap({
            next: (updatedAdv) => {
              patchState(store, {
                adventure: updatedAdv,
                isSaving: false,
                feedbackMessage: 'Dettagli avventura aggiornati con successo!'
              });
            },
            error: (err: any) => {
              console.error('Errore aggiornamento avventura:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore durante il salvataggio dei dettagli.'
              });
            }
          })
        );
      },

      saveItem(formData: FormData): Observable<Item> {
        const sceneId = store.currentScene()?.id;
        if (!sceneId) {
          throw new Error('Nessuna scena selezionata.');
        }

        patchState(store, { isSaving: true, feedbackMessage: null });

        return sceneService.addItemToScene(sceneId, formData).pipe(
          tap({
            next: (savedItem) => {
              updateItemInState(savedItem);
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Oggetto "${savedItem.name}" salvato!`
              });
            },
            error: (err: any) => {
              console.error('Errore salvataggio item:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore salvataggio.'
              });
            }
          })
        );
      },

      updateItem(formData: FormData): Observable<Item> {
        patchState(store, { isSaving: true, feedbackMessage: null });

        return itemService.updateItem(formData).pipe(
          tap({
            next: (updatedItem) => {
              updateItemInState(updatedItem);
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Oggetto "${updatedItem.name}" aggiornato!`
              });
            },
            error: (err: any) => {
              console.error('Errore aggiornamento item:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore aggiornamento.'
              });
            }
          })
        );
      },

      deleteItem(itemId: number): Observable<void> {
        patchState(store, { isSaving: true });

        return itemService.deleteItem(itemId).pipe(
          tap({
            next: () => {
              const current = store.currentScene();
              if (current) {
                const remaining = (current.items ?? []).filter((i) => i.id !== itemId);
                const updatedCurrentScene = { ...current, items: remaining };

                const updatedScenes = store.scenes().map((s) =>
                  s.id === updatedCurrentScene.id ? updatedCurrentScene : s
                );

                patchState(store, {
                  scenes: updatedScenes,
                  currentScene: updatedCurrentScene,
                  selectedItem: store.selectedItem()?.id === itemId ? null : store.selectedItem(),
                  isSaving: false
                });
              }
            },
            error: (err: any) => {
              console.error('Errore eliminazione item:', err);
              patchState(store, { isSaving: false });
            }
          })
        );
      },

      updateInventoryItem(formData: FormData): Observable<InventoryItem> {
        patchState(store, { isSaving: true, feedbackMessage: null });

        return inventoryItemService.updateInventoryItem(formData).pipe(
          tap({
            next: (updatedInv) => {
              const current = store.currentScene();
              if (current) {
                const updatedItems = (current.items ?? []).map((it) =>
                  it.linkedInventoryItem?.id === updatedInv.id
                    ? { ...it, linkedInventoryItem: updatedInv }
                    : it
                );
                const updatedCurrentScene = { ...current, items: updatedItems };

                const updatedScenes = store.scenes().map((s) =>
                  s.id === updatedCurrentScene.id ? updatedCurrentScene : s
                );

                const selected = store.selectedItem();
                const nextSelected = (selected && selected.linkedInventoryItem?.id === updatedInv.id)
                  ? { ...selected, linkedInventoryItem: updatedInv }
                  : selected;

                patchState(store, {
                  scenes: updatedScenes,
                  currentScene: updatedCurrentScene,
                  selectedItem: nextSelected,
                  isSaving: false,
                  feedbackMessage: 'Oggetto inventario aggiornato!'
                });
              }
            },
            error: (err: any) => {
              console.error('Errore aggiornamento inventory item:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore aggiornamento inventario.'
              });
            }
          })
        );
      },

      deleteInventoryItem(inventoryItemId: number): Observable<void> {
        patchState(store, { isSaving: true });

        return inventoryItemService.deleteInventoryItem(inventoryItemId).pipe(
          tap({
            next: () => {
              const current = store.currentScene();
              if (current) {
                const updatedItems = (current.items ?? []).map((it) =>
                  it.linkedInventoryItem?.id === inventoryItemId
                    ? { ...it, linkedInventoryItem: undefined }
                    : it
                );
                const updatedCurrentScene = { ...current, items: updatedItems };

                const updatedScenes = store.scenes().map((s) =>
                  s.id === updatedCurrentScene.id ? updatedCurrentScene : s
                );

                const selected = store.selectedItem();
                patchState(store, {
                  scenes: updatedScenes,
                  currentScene: updatedCurrentScene,
                  selectedItem:
                    selected?.linkedInventoryItem?.id === inventoryItemId
                      ? { ...selected, linkedInventoryItem: undefined }
                      : selected,
                  isSaving: false,
                  feedbackMessage: "Oggetto rimosso dall'inventario."
                });
              }
            },
            error: (err: any) => {
              console.error('Errore eliminazione inventory item:', err);
              patchState(store, { isSaving: false });
            }
          })
        );
      },

      addAction(action: Action): Observable<Action> {
        const currentItem = store.selectedItem();
        if (!currentItem || !currentItem.id) {
          throw new Error('Nessun item valido selezionato');
        }

        patchState(store, { isSaving: true });

        return itemService.addAction(currentItem.id, action).pipe(
          tap({
            next: (savedAction) => {
              const updatedActions = [...(currentItem.actions ?? []), savedAction];
              updateItemInState({ ...currentItem, actions: updatedActions });
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Azione "${savedAction.type}" aggiunta con successo!`
              });
            },
            error: (err: any) => {
              console.error('Errore aggiunta azione:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore salvataggio azione.'
              });
            }
          })
        );
      },

      updateAction(action: Action): Observable<Action> {
        const currentItem = store.selectedItem();
        if (!currentItem || !currentItem.id) {
          throw new Error('Nessun item valido selezionato');
        }

        patchState(store, { isSaving: true });

        return actionService.updateAction(action).pipe(
          tap({
            next: (updatedAction) => {
              const updatedActions = (currentItem.actions ?? []).map((a) =>
                a.id === updatedAction.id ? updatedAction : a
              );
              updateItemInState({ ...currentItem, actions: updatedActions });
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Azione "${updatedAction.type}" modificata con successo!`
              });
            },
            error: (err: any) => {
              console.error('Errore aggiornamento azione:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore aggiornamento azione.'
              });
            }
          })
        );
      },

      deleteAction(actionId: number): Observable<void> {
        patchState(store, { isSaving: true });

        return actionService.deleteAction(actionId).pipe(
          tap({
            next: () => {
              const current = store.selectedItem();
              if (current) {
                const updated = (current.actions ?? []).filter((a) => a.id !== actionId);
                updateItemInState({ ...current, actions: updated });
              }
              patchState(store, { isSaving: false });
            },
            error: () => patchState(store, { isSaving: false })
          })
        );
      }
    };
  })
);
