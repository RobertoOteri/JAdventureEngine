import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { forkJoin, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { Action, GraphicAdventureDto, Item, Scene } from '../../../core/models';
import { AdventureService } from '../../../core/services/adventure.service';
import { SceneService } from '../../../core/services/scene.service';
import { ItemService } from '../../../core/services/item.service';
import { ActionService } from '../../../core/services/action.service';

export interface EditorState {
  adventure: GraphicAdventureDto | null;
  scenes: Scene[];
  currentScene: Scene | null;
  adventureItems: Item[];
  selectedItem: Item | null;
  pendingItemCode: string | null;
  isLoading: boolean;
  isSaving: boolean;
  feedbackMessage: string | null;
}

const initialState: EditorState = {
  adventure: null,
  scenes: [],
  currentScene: null,
  adventureItems: [],
  selectedItem: null,
  pendingItemCode: null,
  isLoading: false,
  isSaving: false,
  feedbackMessage: null
};

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => {
    const combinedSceneList = computed<Item[]>(() => {
      const sceneItems = store.currentScene()?.items ?? [];
      const allSceneItems = (store.scenes() ?? []).flatMap((s) => s.items ?? []);
      const advItems = store.adventureItems() ?? [];

      const map = new Map<string, Item>();
      [...advItems, ...allSceneItems, ...sceneItems].forEach((item) => {
        const key = item.id ? String(item.id) : item.code;
        map.set(key, item);
      });
      return Array.from(map.values());
    });

    return {
      adventureTitle: computed(() => store.adventure()?.title ?? ''),
      combinedSceneList,
      itemsCount: computed(() => (store.currentScene()?.items ?? []).length),
      backgroundUrl: computed(() => store.currentScene()?.backgroundImageUrl ?? '')
    };
  }),

  withMethods((
    store,
    adventureService = inject(AdventureService),
    sceneService = inject(SceneService),
    itemService = inject(ItemService),
    actionService = inject(ActionService)
  ) => {

    const resetState = (): void => {
      patchState(store, initialState);
    };

    const normalizeScene = (scene: Scene): Scene => ({
      ...scene,
      items: scene.items ?? []
    });

    const matchesItem = (a: Item, b: Item): boolean =>
      Boolean((a.id && b.id && a.id === b.id) || a.code === b.code);

    const updateItemInState = (updatedItem: Item): void => {
      let foundInScenes = false;

      const updatedScenes = store.scenes().map((scene) => {
        const items = scene.items ?? [];
        const idx = items.findIndex((i) => matchesItem(i, updatedItem));
        if (idx >= 0) {
          foundInScenes = true;
          const nextItems = items.map((it, i) => (i === idx ? updatedItem : it));
          return { ...scene, items: nextItems };
        }
        return scene;
      });

      const current = store.currentScene();
      let updatedCurrentScene = current
        ? updatedScenes.find((s) => s.id === current.id || s.code === current.code) ?? current
        : null;

      if (!foundInScenes && updatedItem.hotspot && updatedCurrentScene) {
        const nextItems = [...(updatedCurrentScene.items ?? []), updatedItem];
        updatedCurrentScene = { ...updatedCurrentScene, items: nextItems };
        for (let i = 0; i < updatedScenes.length; i++) {
          if (updatedScenes[i].id === updatedCurrentScene.id || updatedScenes[i].code === updatedCurrentScene.code) {
            updatedScenes[i] = updatedCurrentScene;
          }
        }
      }

      const advItems = store.adventureItems() ?? [];
      const advIdx = advItems.findIndex((i) => matchesItem(i, updatedItem));
      let updatedAdvItems = advItems;
      if (advIdx >= 0) {
        updatedAdvItems = advItems.map((it, i) => (i === advIdx ? updatedItem : it));
      } else if (!updatedItem.hotspot) {
        updatedAdvItems = [...advItems, updatedItem];
      }

      patchState(store, {
        scenes: updatedScenes,
        currentScene: updatedCurrentScene,
        adventureItems: updatedAdvItems,
        selectedItem: updatedItem
      });
    };

    const findItemEverywhere = (codeOrId: string | number): Item | undefined => {
      for (const s of store.scenes()) {
        for (const it of s.items ?? []) {
          if (it.code === codeOrId || it.id === codeOrId) return it;
        }
      }
      for (const it of store.adventureItems()) {
        if (it.code === codeOrId || it.id === codeOrId) return it;
      }
      return undefined;
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
            adventureItems: [],
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
                rawScenes: sceneService.getScenes(adventure.code)
              }).pipe(
                tap({
                  next: ({ rawScenes }) => {
                    const scenes = (rawScenes ?? []).map(normalizeScene);
                    let active: Scene | null = null;

                    if (sceneId) {
                      active = scenes.find((s) => s.id === sceneId) || null;
                    } else if (sceneCode && sceneCode !== 'new') {
                      active = scenes.find((s) => s.code === sceneCode) || null;
                    } else {
                      active = scenes.find((s) => s.code === adventure.initialSceneCode) || scenes[0] || null;
                    }

                    const pendingCode = store.pendingItemCode() || sessionStorage.getItem('pending_selected_item');
                    let resolvedItem: Item | null = null;

                    if (pendingCode) {
                      for (const s of scenes) {
                        const found = (s.items ?? []).find(i => i.code === pendingCode);
                        if (found) {
                          resolvedItem = found;
                          break;
                        }
                      }
                    }

                    if (resolvedItem) {
                      sessionStorage.removeItem('pending_selected_item');
                    }

                    patchState(store, {
                      adventure,
                      scenes,
                      currentScene: active,
                      selectedItem: resolvedItem,
                      pendingItemCode: resolvedItem ? null : pendingCode,
                      isLoading: false
                    });

                    const currentAdvCode = adventure.code;
                    if (currentAdvCode) {
                      itemService.getItemsByAdventure(currentAdvCode).subscribe({
                        next: (allItems) => {
                          patchState(store, { adventureItems: allItems });

                          const codeToResolve = store.pendingItemCode() || sessionStorage.getItem('pending_selected_item');
                          if (codeToResolve) {
                            sessionStorage.removeItem('pending_selected_item');
                            const foundLater = findItemEverywhere(codeToResolve);
                            if (foundLater) {
                              patchState(store, { selectedItem: foundLater, pendingItemCode: null });
                            }
                          }
                        },
                        error: (err) => console.error('Errore caricamento oggetti avventura:', err)
                      });
                    }
                  },
                  error: (err: any) => {
                    console.error('Errore caricamento scene:', err);
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
      findItemEverywhere,
      updateItemInState,

      loadInventoryCatalog(): void {
        const advCode = store.adventure()?.code;
        if (!advCode) return;

        itemService.getItemsByAdventure(advCode).subscribe({
          next: (allItems) => {
            patchState(store, { adventureItems: allItems });
          },
          error: (err) => console.error('Errore caricamento oggetti:', err)
        });
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
        sessionStorage.removeItem('pending_selected_item');
        patchState(store, { selectedItem: item, pendingItemCode: null });
      },

      selectItemByCode(code: string): void {
        sessionStorage.setItem('pending_selected_item', code);
        const found = findItemEverywhere(code);
        if (found) {
          patchState(store, { selectedItem: found, pendingItemCode: null });
        } else {
          patchState(store, { pendingItemCode: code });
        }
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
          switchMap((savedItem) => {
            if (!savedItem.id) {
              const currentAdvCode = store.adventure()?.code;
              if (currentAdvCode) {
                return itemService.getItemsByAdventure(currentAdvCode).pipe(
                  tap((allItems) => {
                    const freshItem = allItems.find((i) => i.code === savedItem.code) ?? savedItem;
                    updateItemInState(freshItem);
                    patchState(store, {
                      isSaving: false,
                      feedbackMessage: `Oggetto "${freshItem.name}" salvato!`
                    });
                  }),
                  switchMap(() => of(savedItem))
                );
              }
            }

            updateItemInState(savedItem);
            patchState(store, {
              isSaving: false,
              feedbackMessage: `Oggetto "${savedItem.name}" salvato!`
            });
            return of(savedItem);
          }),
          tap({
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

      saveInventoryItem(formData: FormData): Observable<Item> {
        const adventureId = store.adventure()?.id;
        if (!adventureId) {
          throw new Error('Nessuna avventura selezionata.');
        }

        patchState(store, { isSaving: true, feedbackMessage: null });

        return adventureService.addItem(adventureId, formData).pipe(
          switchMap((savedItem) => {
            if (!savedItem.id) {
              const currentAdvCode = store.adventure()?.code;
              if (currentAdvCode) {
                return itemService.getItemsByAdventure(currentAdvCode).pipe(
                  tap((allItems) => {
                    const freshItem = allItems.find((i) => i.code === savedItem.code) ?? savedItem;
                    const currentList = store.adventureItems() ?? [];
                    patchState(store, {
                      adventureItems: [...currentList.filter(i => i.code !== freshItem.code), freshItem],
                      selectedItem: freshItem,
                      isSaving: false,
                      feedbackMessage: `Oggetto globale "${freshItem.name}" salvato con successo!`
                    });
                  }),
                  switchMap(() => of(savedItem))
                );
              }
            }

            const currentList = store.adventureItems() ?? [];
            patchState(store, {
              adventureItems: [...currentList, savedItem],
              selectedItem: savedItem,
              isSaving: false,
              feedbackMessage: `Oggetto globale "${savedItem.name}" salvato con successo!`
            });
            return of(savedItem);
          }),
          tap({
            error: (err: any) => {
              console.error('Errore salvataggio oggetto inventario:', err);
              patchState(store, {
                isSaving: false,
                feedbackMessage: err?.error?.message || "Errore durante il salvataggio dell'oggetto."
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
              const updatedScenes = store.scenes().map((s) => ({
                ...s,
                items: (s.items ?? []).filter((i) => i.id !== itemId)
              }));

              const current = store.currentScene();
              const updatedCurrentScene = current
                ? updatedScenes.find((s) => s.id === current.id || s.code === current.code) ?? null
                : null;

              const updatedAdventureItems = store.adventureItems().filter((i) => i.id !== itemId);

              patchState(store, {
                scenes: updatedScenes,
                currentScene: updatedCurrentScene,
                adventureItems: updatedAdventureItems,
                selectedItem: store.selectedItem()?.id === itemId ? null : store.selectedItem(),
                isSaving: false
              });
            },
            error: (err: any) => {
              console.error('Errore eliminazione item:', err);
              patchState(store, { isSaving: false });
            }
          })
        );
      },

      addAction(action: Action): Observable<Action> {
        const currentItem = store.selectedItem();
        const itemId = currentItem?.id ?? (currentItem?.code ? findItemEverywhere(currentItem.code)?.id : undefined);

        if (!itemId) {
          throw new Error("Nessun item valido selezionato o l'elemento non è ancora stato salvato sul database.");
        }

        patchState(store, { isSaving: true });

        return itemService.addAction(itemId, action).pipe(
          tap({
            next: (savedAction) => {
              const itemToUpdate = currentItem ?? findItemEverywhere(itemId);
              if (itemToUpdate) {
                const currentActions = itemToUpdate.actions ?? [];
                const existingIndex = currentActions.findIndex(
                  (a) => (savedAction.id && a.id === savedAction.id) || a.type === savedAction.type
                );
                const updatedActions = existingIndex >= 0
                  ? currentActions.map((a, i) => (i === existingIndex ? savedAction : a))
                  : [...currentActions, savedAction];

                updateItemInState({ ...itemToUpdate, actions: updatedActions });
              }
              patchState(store, {
                isSaving: false,
                feedbackMessage: `Azione "${savedAction.type}" aggiunta!`
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
        if (!currentItem) {
          throw new Error('Nessun elemento selezionato');
        }

        patchState(store, { isSaving: true });

        return actionService.updateAction(action).pipe(
          tap({
            next: (updatedAction) => {
              const currentActions = currentItem.actions ?? [];
              const updatedItemActions = currentActions.map((a) => {
                if (action.id && a.id === action.id) return updatedAction;
                if (a.type === action.type) return updatedAction;
                return a;
              });

              updateItemInState({
                ...currentItem,
                actions: updatedItemActions
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
                updateItemInState({
                  ...current,
                  actions: updatedItemActions
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
