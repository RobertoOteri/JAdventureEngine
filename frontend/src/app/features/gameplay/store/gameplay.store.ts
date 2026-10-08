import { inject, computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { GamePlayService } from '../../../core/services/game-play.service';
import {
  GameStateDto,
  GameActionDto,
  GameSaveDto,
  Item,
  InventoryItem
} from '../../../core/models';

export interface RadialMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  item: Item | null;
}

export interface GameplayState {
  adventureCode: string | null;
  gameState: GameStateDto | null;
  savesList: GameSaveDto[];
  isLoading: boolean;
  feedbackMessage: string | null;
  isInventoryOpen: boolean;
  isPauseMenuOpen: boolean;
  radialMenu: RadialMenuState;
}

const initialRadialState: RadialMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  item: null
};

const initialState: GameplayState = {
  adventureCode: null,
  gameState: null,
  savesList: [],
  isLoading: false,
  feedbackMessage: null,
  isInventoryOpen: false,
  isPauseMenuOpen: false,
  radialMenu: initialRadialState
};

export const GameplayStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    currentSaveCode: computed(() => store.gameState()?.saveCode ?? null),
    currentScene: computed(() => store.gameState()?.currentScene ?? null),
    inventory: computed<InventoryItem[]>(() => store.gameState()?.inventory ?? []),
    inventoryCount: computed(() => store.gameState()?.inventory?.length ?? 0),
    visibleItemCodes: computed<string[]>(() => store.gameState()?.visibleSceneItemCodes ?? []),
    worldFlags: computed(() => store.gameState()?.worldFlags ?? {}),
    currentSceneBackgroundUrl: computed(() => {
      return store.gameState()?.currentScene?.backgroundImageUrl ?? '';
    })
  })),

  withMethods((store, gameService = inject(GamePlayService)) => {
    let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

    const setFeedbackMessage = (message: string | null, durationMs = 3500): void => {
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
        feedbackTimer = null;
      }
      patchState(store, { feedbackMessage: message });

      if (message) {
        feedbackTimer = setTimeout(() => {
          patchState(store, { feedbackMessage: null });
          feedbackTimer = null;
        }, durationMs);
      }
    };

    const closeRadialMenu = (): void => {
      patchState(store, { radialMenu: initialRadialState });
    };

    const openRadialMenu = (item: Item, x: number, y: number): void => {
      patchState(store, {
        radialMenu: {
          isOpen: true,
          x,
          y,
          item
        }
      });
    };

    const toggleInventory = (): void => {
      patchState(store, (state) => ({ isInventoryOpen: !state.isInventoryOpen }));
    };

    const setInventoryOpen = (isOpen: boolean): void => {
      patchState(store, { isInventoryOpen: isOpen });
    };

    const setAdventureCode = (code: string): void => {
      patchState(store, { adventureCode: code });
    };

    const fetchSaves = rxMethod<string>(
      pipe(
        switchMap((adventureCode) =>
          gameService.getSavesForAdventure(adventureCode).pipe(
            tap({
              next: (savesList) => patchState(store, { savesList }),
              error: (err) => console.error('Errore recupero lista salvataggi:', err)
            })
          )
        )
      )
    );

    const togglePauseMenu = (): void => {
      patchState(store, (state) => {
        const nextState = !state.isPauseMenuOpen;
        if (nextState && state.adventureCode) {
          fetchSaves(state.adventureCode);
        }
        return { isPauseMenuOpen: nextState };
      });
    };

    const setPauseMenuOpen = (isOpen: boolean): void => {
      patchState(store, { isPauseMenuOpen: isOpen });
      const advCode = store.adventureCode();
      if (isOpen && advCode) {
        fetchSaves(advCode);
      }
    };

    const startNewGame = rxMethod<string>(
      pipe(
        tap((adventureCode) =>
          patchState(store, {
            adventureCode,
            isLoading: true,
            feedbackMessage: null,
            isPauseMenuOpen: false,
            savesList: []
          })
        ),
        switchMap((adventureCode) =>
          gameService.startNewGame(adventureCode).pipe(
            switchMap((gameState) =>
              gameService.getSavesForAdventure(adventureCode).pipe(
                tap({
                  next: (savesList) => {
                    patchState(store, {
                      gameState,
                      savesList,
                      isLoading: false
                    });
                    closeRadialMenu();
                  },
                  error: () => {
                    patchState(store, {
                      gameState,
                      savesList: [],
                      isLoading: false
                    });
                    closeRadialMenu();
                  }
                })
              )
            ),
            tap({
              error: (err) => {
                console.error('Errore avvio nuova partita:', err);
                patchState(store, { isLoading: false });
                setFeedbackMessage('Impossibile avviare la partita.');
              }
            })
          )
        )
      )
    );

    const continueGame = rxMethod<string>(
      pipe(
        tap((adventureCode) =>
          patchState(store, {
            adventureCode,
            isLoading: true,
            feedbackMessage: null,
            isPauseMenuOpen: false
          })
        ),
        switchMap((adventureCode) =>
          gameService.continueGame(adventureCode).pipe(
            tap({
              next: (gameState) => {
                patchState(store, { gameState, isLoading: false });
                closeRadialMenu();
              },
              error: (err) => {
                console.error('Errore ripresa partita:', err);
                patchState(store, { isLoading: false });
                setFeedbackMessage('Nessun salvataggio trovato per continuare.');
              }
            })
          )
        )
      )
    );

    const loadGame = rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            feedbackMessage: null,
            isPauseMenuOpen: false
          })
        ),
        switchMap((saveCode) =>
          gameService.loadGame(saveCode).pipe(
            tap({
              next: (gameState) => {
                patchState(store, { gameState, isLoading: false });
                closeRadialMenu();
              },
              error: (err) => {
                console.error('Errore caricamento partita:', err);
                patchState(store, { isLoading: false });
                setFeedbackMessage('Errore nel caricamento del salvataggio.');
              }
            })
          )
        )
      )
    );

    const executeAction = rxMethod<GameActionDto>(
      pipe(
        switchMap((actionDto) => {
          const saveCode = store.currentSaveCode();
          if (!saveCode) {
            console.error('Nessun saveCode attivo presente nello store');
            return [];
          }

          return gameService.executeAction(saveCode, actionDto).pipe(
            tap({
              next: (result) => {
                if (result.state) {
                  patchState(store, { gameState: result.state });
                }
                setFeedbackMessage(result.feedbackMessage);
                closeRadialMenu();
              },
              error: (err) => {
                console.error('Errore esecuzione azione:', err);
                const msg = err?.error?.message || err?.error?.feedbackMessage || 'Non succede nulla.';
                setFeedbackMessage(msg);
                closeRadialMenu();
              }
            })
          );
        })
      )
    );

    const saveCurrentGame = rxMethod<string | undefined>(
      pipe(
        switchMap((saveName) => {
          const saveCode = store.currentSaveCode();
          const advCode = store.adventureCode();
          if (!saveCode) {
            console.error('Nessun salvataggio attivo da salvare');
            return [];
          }

          return gameService.createSave(saveCode, saveName).pipe(
            tap({
              next: () => {
                setFeedbackMessage('Partita salvata con successo!');
                if (advCode) {
                  fetchSaves(advCode);
                }
              },
              error: (err) => {
                console.error('Errore durante il salvataggio:', err);
                setFeedbackMessage('Errore durante il salvataggio della partita.');
              }
            })
          );
        })
      )
    );

    const resetStore = (): void => {
      patchState(store, initialState);
    };

    return {
      setFeedbackMessage,
      openRadialMenu,
      closeRadialMenu,
      toggleInventory,
      setInventoryOpen,
      togglePauseMenu,
      setPauseMenuOpen,
      setAdventureCode,
      startNewGame,
      continueGame,
      loadGame,
      fetchSaves,
      executeAction,
      saveCurrentGame,
      resetStore
    };
  })
);
