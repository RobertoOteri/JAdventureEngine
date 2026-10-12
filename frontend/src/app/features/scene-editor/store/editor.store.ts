import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { Action, GraphicAdventureDto, InventoryItem, Item, Scene } from '../../../core/models';
import { AdventureService } from '../../../core/services/adventure.service';
import { SceneService } from '../../../core/services/scene.service';
import { ItemService } from '../../../core/services/item.service';
import { ActionService } from '../../../core/services/action.service';
import { InventoryItemService } from '../../../core/services/inventory-item.service';
import { environment } from '../../../../environments/environment';

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

const BACKEND_BASE_URL = environment.apiUrl.replace(/\/api\/?$/, '');

export const EditorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    adventureTitle: computed(() => store.adventure()?.title ?? ''),
    itemsCount: computed(() => store.currentScene()?.items?.length ?? 0),
    backgroundUrl: computed(() => {
      const bg = store.currentScene()?.backgroundImageUrl;
      if (!bg) return '';
      if (/^https?:\/\//i.test(bg)) return bg;
      return `${BACKEND_BASE_URL}${bg.startsWith('/') ? '' : '/'}${bg}`;
    })
  })),

  withMethods((
    store,
    adventureService = inject(AdventureService),
    sceneService = inject(SceneService),
    itemService = inject(ItemService),
    actionService = inject(ActionService),
    inventoryItemService = inject(InventoryItemService)
  ) => {

    const updateItemInState = (updatedItem: Item): void => {
      const scene = store.currentScene();
      if (!scene) return;

      const items = scene.items || [];
      const index = items.findIndex((i) => i.code === updatedItem.code);
      const updatedItems = index >= 0
        ? items.map((i, idx) => (idx === index ? updatedItem : i))
        : [...items, updatedItem];

      const updatedCurrentScene = { ...scene, items: updatedItems };

      const updatedScenes = store.scenes().map((s) =>
        s.code === updatedCurrentScene.code ? updatedCurrentScene : s
      );

      patchState(store, {
        scenes: updatedScenes,
        currentScene: updatedCurrentScene,
        selectedItem: updatedItem
      });
    };

    const loadAdventureAndScenes = rxMethod<{ adventureCode: string; sceneCode?: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, feedbackMessage: null })),
        switchMap(({ adventureCode, sceneCode }) =>
          adventureService.getAdventureByCode(adventureCode).pipe(
            switchMap((adventure) =>
              sceneService.getAllScenes(adventureCode).pipe(
                tap({
                  next: (scenes) => {
                    const targetCode = sceneCode || adventure.initialSceneCode || scenes[0]?.code;
                    const active = scenes.find((s) => s.code === targetCode) || null;
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
                      feedbackMessage: 'Impossibile caricare i dati della scena.'
                    });
                  }
                })
              )
            )
          )
        )
      )
    );

    return {
      loadAdventureAndScenes,

      selectScene(sceneCode: string): void {
        const found = store.scenes().find((s) => s.code === sceneCode) || null;
        patchState(store, { currentScene: found, selectedItem: null });
      },

      deleteScene(sceneCode: string): Observable<void> {
        patchState(store, { isSaving: true });
        const advCode = store.adventure()?.code || '';

        return sceneService.deleteScene(advCode, sceneCode).pipe(
          tap({
            next: () => {
              const updatedScenes = store.scenes().filter((s) => s.code !== sceneCode);
              const isCurrent = store.currentScene()?.code === sceneCode;
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
        const advCode = store.adventure()?.code || '';

        return adventureService.updateAdventure(advCode, formData).pipe(
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
        patchState(store, { isSaving: true, feedbackMessage: null });
        const advCode = store.adventure()?.code || '';
        const scnCode = store.currentScene()?.code || '';

        return itemService.createItem(advCode, scnCode, formData).pipe(
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

      updateItem(itemCode: string, formData: FormData): Observable<Item> {
        patchState(store, { isSaving: true, feedbackMessage: null });
        const advCode = store.adventure()?.code || '';
        const scnCode = store.currentScene()?.code || '';

        return itemService.updateItem(advCode, scnCode, itemCode, formData).pipe(
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

      deleteItem(itemCode: string): Observable<void> {
        patchState(store, { isSaving: true });
        const advCode = store.adventure()?.code || '';
        const scnCode = store.currentScene()?.code || '';

        return itemService.deleteItem(advCode, scnCode, itemCode).pipe(
          tap({
            next: () => {
              const current = store.currentScene();
              if (current) {
                const remaining = (current.items || []).filter((i) => i.code !== itemCode);
                const updatedCurrentScene = { ...current, items: remaining };

                const updatedScenes = store.scenes().map((s) =>
                  s.code === updatedCurrentScene.code ? updatedCurrentScene : s
                );

                patchState(store, {
                  scenes: updatedScenes,
                  currentScene: updatedCurrentScene,
                  selectedItem: store.selectedItem()?.code === itemCode ? null : store.selectedItem(),
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

      updateInventoryItem(itemCode: string, formData: FormData): Observable<InventoryItem> {
        patchState(store, { isSaving: true, feedbackMessage: null });
        const advCode = store.adventure()?.code || '';

        return inventoryItemService.updateInventoryItem(advCode, itemCode, formData).pipe(
          tap({
            next: (updatedInv) => {
              const current = store.currentScene();
              if (current) {
                const updatedItems = (current.items || []).map((it) =>
                  it.code === itemCode ? { ...it, linkedInventoryItem: updatedInv } : it
                );
                const updatedCurrentScene = { ...current, items: updatedItems };

                const updatedScenes = store.scenes().map((s) =>
                  s.code === updatedCurrentScene.code ? updatedCurrentScene : s
                );

                const selected = store.selectedItem();
                patchState(store, {
                  scenes: updatedScenes,
                  currentScene: updatedCurrentScene,
                  selectedItem: selected?.code === itemCode ? { ...selected, linkedInventoryItem: updatedInv } : selected,
                  isSaving: false,
                  feedbackMessage: `Oggetto inventario aggiornato!`
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

      deleteInventoryItem(itemCode: string): Observable<void> {
        patchState(store, { isSaving: true });
        const advCode = store.adventure()?.code || '';

        return inventoryItemService.deleteInventoryItem(advCode, itemCode).pipe(
          tap({
            next: () => {
              const current = store.currentScene();
              if (current) {
                const updatedItems = (current.items || []).map((it) =>
                  it.code === itemCode ? { ...it, linkedInventoryItem: undefined } : it
                );
                const updatedCurrentScene = { ...current, items: updatedItems };

                const updatedScenes = store.scenes().map((s) =>
                  s.code === updatedCurrentScene.code ? updatedCurrentScene : s
                );

                const selected = store.selectedItem();
                patchState(store, {
                  scenes: updatedScenes,
                  currentScene: updatedCurrentScene,
                  selectedItem: selected?.code === itemCode ? { ...selected, linkedInventoryItem: undefined } : selected,
                  isSaving: false,
                  feedbackMessage: `Oggetto rimosso dall'inventario.`
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

      addAction(itemCode: string, action: Action): Observable<Action> {
        patchState(store, { isSaving: true });
        const advCode = store.adventure()?.code || '';
        const scnCode = store.currentScene()?.code || '';

        return actionService.addAction(advCode, scnCode, itemCode, action).pipe(
          tap({
            next: (newAction) => {
              const current = store.selectedItem();
              if (current && current.code === itemCode) {
                const updated = [...(current.actions || []), newAction];
                updateItemInState({ ...current, actions: updated });
              }
              patchState(store, { isSaving: false });
            },
            error: () => patchState(store, { isSaving: false })
          })
        );
      },

      deleteAction(itemCode: string, actionCode: string): Observable<void> {
        patchState(store, { isSaving: true });

        return actionService.deleteAction(actionCode).pipe(
          tap({
            next: () => {
              const current = store.selectedItem();
              if (current && current.code === itemCode) {
                const updated = (current.actions || []).filter((a) => a.code !== actionCode);
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
