import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { Action, GraphicAdventureDto, InventoryItem, Item, Scene } from '../../../core/models';
import { AdventureService } from '../../../core/services/adventure.service';
import { SceneService } from '../../../core/services/scene.service';
import { ItemService } from '../../../core/services/item.service';
import { ActionService } from '../../../core/services/action.service';
import { InventoryItemService } from '../../../core/services/inventory-item.service';

export interface EditorState {
  adventure: GraphicAdventureDto | null;
  scenes: Scene[];
  inventoryItems: InventoryItem[];
  currentScene: Scene | null;
  selectedItem: Item | null;
  isLoading: boolean;
  isSaving: boolean;
  feedbackMessage: string | null;
}

const initialState: EditorState = {
  adventure: null,
  scenes: [],
  inventoryItems: [],
  currentScene: null,
  selectedItem: null,
  isLoading: false,
  isSaving: false,
  feedbackMessage: null
};

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => {
    const standaloneInventoryAsItems = computed<Item[]>(() => {
      const linkedCodes = new Set<string>();
      for (const scene of store.scenes()) {
        for (const item of scene.items ?? []) {
          if (item.linkedInventoryItem?.code) {
            linkedCodes.add(item.linkedInventoryItem.code);
          }
        }
      }

      return store.inventoryItems()
        .filter((inv) => !linkedCodes.has(inv.code))
        .map((inv) => ({
          id: undefined, // Nessun ID di Item di scena: identifica che è un InventoryItem puro
          code: inv.code,
          name: inv.name,
          imageUrl: '',
          initiallyVisible: true,
          actions: [],
          linkedInventoryItem: inv
        }));
    });

    const combinedSceneList = computed<Item[]>(() => {
      const sceneItems = store.currentScene()?.items ?? [];
      return [...sceneItems, ...standaloneInventoryAsItems()];
    });

    return {
      adventureTitle: computed(() => store.adventure()?.title ?? ''),
      standaloneInventoryAsItems,
      combinedSceneList,
      itemsCount: computed(() => combinedSceneList().length),
      backgroundUrl: computed(() => store.currentScene()?.backgroundImageUrl ?? '')
    };
  }),

  withMethods((
    store,
    adventureService = inject(AdventureService),
    sceneService = inject(SceneService),
    itemService = inject(ItemService),
    actionService = inject(ActionService),
    inventoryItemService = inject(InventoryItemService)
  ) => {

    const resetState = (): void => {
      patchState(store, initialState);
    };

    const normalizeScene = (scene: Scene): Scene => ({
      ...scene,
      items: scene.items ?? []
    });

    const updateItemInState = (updatedItem: Item): void => {
      if (!updatedItem.id && updatedItem.linkedInventoryItem) {
        const updatedInv = updatedItem.linkedInventoryItem;
        const invList = store.inventoryItems();
        const exists = invList.some((i) => i.id === updatedInv.id || i.code === updatedInv.code);
        const nextInvList = exists
          ? invList.map((i) => (i.id === updatedInv.id || i.code === updatedInv.code ? updatedInv : i))
          : [...invList, updatedInv];

        patchState(store, {
          inventoryItems: nextInvList,
          selectedItem: {
            ...updatedItem,
            name: updatedInv.name,
            code: updatedInv.code,
            linkedInventoryItem: updatedInv
          }
        });
        return;
      }

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

      // Sincronizza anche nella lista globale inventoryItems se ha un linkedInventoryItem
      let nextInvList = store.inventoryItems();
      if (updatedItem.linkedInventoryItem) {
        const inv = updatedItem.linkedInventoryItem;
        const invIdx = nextInvList.findIndex((i) => i.id === inv.id || i.code === inv.code);
        nextInvList = invIdx >= 0
          ? nextInvList.map((i, idx) => (idx === invIdx ? inv : i))
          : [...nextInvList, inv];
      }

      patchState(store, {
        scenes: updatedScenes,
        inventoryItems: nextInvList,
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
            inventoryItems: [],
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
            switchMap((adventure) => {
              if (!adventure) return of(null);

              return forkJoin({
                rawScenes: sceneService.getScenes(adventure.code),
                invItems: inventoryItemService.getAdventureInventoryItems(adventure.code)
              }).pipe(
                tap({
                  next: ({ rawScenes, invItems }) => {
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
                      inventoryItems: invItems ?? [],
                      currentScene: active,
                      selectedItem: null,
                      isLoading: false
                    });
                  },
                  error: (err: any) => {
                    console.error('Errore caricamento scene/inventario:', err);
                    patchState(store, {
                      isLoading: false,
                      feedbackMessage: 'Impossibile caricare i dati delle scene.'
                    });
                  }
                })
              );
            }),
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

      createStandaloneInventoryItem(formData: FormData): Observable<InventoryItem> {
        const adventureId = store.adventure()?.id;
        if (!adventureId) {
          throw new Error('Nessuna avventura caricata.');
        }

        patchState(store, { isSaving: true, feedbackMessage: null });

        return adventureService.addInventoryItem(adventureId, formData).pipe(
          tap({
            next: (createdInv) => {
              const nextInvList = [...store.inventoryItems(), createdInv];
              const virtualItem: Item = {
                id: undefined,
                code: createdInv.code,
                name: createdInv.name,
                imageUrl: '',
                initiallyVisible: true,
                actions: [],
                linkedInventoryItem: createdInv
              };

              patchState(store, {
                inventoryItems: nextInvList,
                selectedItem: virtualItem,
                isSaving: false,
                feedbackMessage: `Oggetto inventario "${createdInv.name}" creato!`
              });
            },
            error: (err: any) => {
              console.error('Errore creazione inventory item:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore creazione oggetto inventario.'
              });
            }
          })
        );
      },

      updateInventoryItem(formData: FormData): Observable<InventoryItem> {
        patchState(store, { isSaving: true, feedbackMessage: null });

        return inventoryItemService.updateInventoryItem(formData).pipe(
          tap({
            next: (updatedInv) => {
              const nextInvList = store.inventoryItems().map((i) =>
                i.id === updatedInv.id ? updatedInv : i
              );

              const current = store.currentScene();
              let updatedScenes = store.scenes();
              let updatedCurrentScene = current;

              if (current) {
                const updatedItems = (current.items ?? []).map((it) =>
                  it.linkedInventoryItem?.id === updatedInv.id
                    ? { ...it, linkedInventoryItem: updatedInv }
                    : it
                );
                updatedCurrentScene = { ...current, items: updatedItems };
                updatedScenes = store.scenes().map((s) =>
                  s.id === updatedCurrentScene!.id ? updatedCurrentScene! : s
                );
              }

              const selected = store.selectedItem();
              const nextSelected = (selected && selected.linkedInventoryItem?.id === updatedInv.id)
                ? {
                  ...selected,
                  name: selected.id ? selected.name : updatedInv.name,
                  linkedInventoryItem: updatedInv
                }
                : selected;

              patchState(store, {
                inventoryItems: nextInvList,
                scenes: updatedScenes,
                currentScene: updatedCurrentScene,
                selectedItem: nextSelected,
                isSaving: false,
                feedbackMessage: 'Oggetto inventario aggiornato!'
              });
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
              const nextInvList = store.inventoryItems().filter((i) => i.id !== inventoryItemId);
              const current = store.currentScene();
              let updatedScenes = store.scenes();
              let updatedCurrentScene = current;

              if (current) {
                const updatedItems = (current.items ?? []).map((it) =>
                  it.linkedInventoryItem?.id === inventoryItemId
                    ? { ...it, linkedInventoryItem: undefined }
                    : it
                );
                updatedCurrentScene = { ...current, items: updatedItems };
                updatedScenes = store.scenes().map((s) =>
                  s.id === updatedCurrentScene!.id ? updatedCurrentScene! : s
                );
              }

              const selected = store.selectedItem();
              const isStandaloneDeleted = !selected?.id && selected?.linkedInventoryItem?.id === inventoryItemId;

              patchState(store, {
                inventoryItems: nextInvList,
                scenes: updatedScenes,
                currentScene: updatedCurrentScene,
                selectedItem: isStandaloneDeleted
                  ? null
                  : selected?.linkedInventoryItem?.id === inventoryItemId
                    ? { ...selected, linkedInventoryItem: undefined }
                    : selected,
                isSaving: false,
                feedbackMessage: "Oggetto rimosso dall'inventario."
              });
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
          throw new Error('Nessun item di scena valido selezionato');
        }

        patchState(store, { isSaving: true });

        return itemService.addAction(currentItem.id, action).pipe(
          tap({
            next: (savedAction) => {
              const updatedActions = [...(currentItem.actions ?? []), savedAction];
              updateItemInState({ ...currentItem, actions: updatedActions });
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Azione "${savedAction.type}" aggiunta all'hotspot!`
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

      addInventoryAction(action: Action): Observable<Action> {
        const currentItem = store.selectedItem();
        const invItem = currentItem?.linkedInventoryItem;
        if (!currentItem || !invItem?.id) {
          throw new Error('Nessun oggetto inventario valido selezionato');
        }

        patchState(store, { isSaving: true });

        return inventoryItemService.addActionToInventoryItem(invItem.id, action).pipe(
          tap({
            next: (savedAction) => {
              const updatedInvActions = [...(invItem.actions ?? []), savedAction];
              const updatedInvItem: InventoryItem = { ...invItem, actions: updatedInvActions };
              updateItemInState({ ...currentItem, linkedInventoryItem: updatedInvItem });
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Azione inventario "${savedAction.type}" aggiunta!`
              });
            },
            error: (err: any) => {
              console.error('Errore aggiunta azione inventario:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || 'Errore salvataggio azione inventario.'
              });
            }
          })
        );
      },

      updateAction(action: Action): Observable<Action> {
        const currentItem = store.selectedItem();
        if (!currentItem) {
          throw new Error('Nessun elemento selezionato');
        }

        patchState(store, { isSaving: true });

        return actionService.updateAction(action).pipe(
          tap({
            next: (updatedAction) => {
              const updatedItemActions = (currentItem.actions ?? []).map((a) =>
                a.id === updatedAction.id ? updatedAction : a
              );

              let updatedInv = currentItem.linkedInventoryItem;
              if (updatedInv) {
                const updatedInvActions = (updatedInv.actions ?? []).map((a) =>
                  a.id === updatedAction.id ? updatedAction : a
                );
                updatedInv = { ...updatedInv, actions: updatedInvActions };
              }

              updateItemInState({
                ...currentItem,
                actions: updatedItemActions,
                linkedInventoryItem: updatedInv
              });

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
                const updatedItemActions = (current.actions ?? []).filter((a) => a.id !== actionId);
                let updatedInv = current.linkedInventoryItem;
                if (updatedInv) {
                  updatedInv = {
                    ...updatedInv,
                    actions: (updatedInv.actions ?? []).filter((a) => a.id !== actionId)
                  };
                }
                updateItemInState({
                  ...current,
                  actions: updatedItemActions,
                  linkedInventoryItem: updatedInv
                });
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
