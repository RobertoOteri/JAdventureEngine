import { inject, computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { GamePlayService } from '../../../core/services/game-play.service';
import { GameSaveService } from '../../../core/services/game-save.service';
import { ActionService } from '../../../core/services/action.service';
import {
  GameStateDto,
  GameActionDto,
  GameSaveDto,
  Item,
  InventoryItem,
  ActionType,
  GameActionResultDto
} from '../../../core/models';

export interface RadialMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  item: Item | null;
}

export interface GameplayState {
  adventureCode: string | null;
  currentSaveCode: string | null;
  gameState: GameStateDto | null;
  savesList: GameSaveDto[];
  isLoading: boolean;
  feedbackMessage: string | null;
  endingMessage: string | null;
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
  currentSaveCode: null,
  gameState: null,
  savesList: [],
  isLoading: false,
  feedbackMessage: null,
  endingMessage: null,
  isInventoryOpen: false,
  isPauseMenuOpen: false,
  radialMenu: initialRadialState
};

export const GameplayStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    currentScene: computed(() => store.gameState()?.currentScene ?? null),
    inventory: computed<InventoryItem[]>(() => store.gameState()?.inventory ?? []),
    inventoryCount: computed(() => store.gameState()?.inventory?.length ?? 0),
    visibleItemCodes: computed<string[]>(() => store.gameState()?.visibleItemCodes ?? []),
    adventureFlags: computed(() => store.gameState()?.adventureFlags ?? {}),
    isCompleted: computed(() => store.gameState()?.completed ?? false),
    currentSceneBackgroundUrl: computed(() => {
      return store.gameState()?.currentScene?.backgroundImageUrl ?? '';
    })
  })),

  withMethods((
    store,
    gameService = inject(GamePlayService),
    saveService = inject(GameSaveService),
    actionService = inject(ActionService)
  ) => {
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
          saveService.getSavesForAdventure(adventureCode).pipe(
            tap({
              next: (savesList) => patchState(store, { savesList }),
              error: (err) => console.error('Errore recupero lista salvataggi:', err)
            })
          )
        )
      )
    );

    const setPauseMenuOpen = (isOpen: boolean): void => {
      if (isOpen) {
        syncAutoSave();
      }
      patchState(store, { isPauseMenuOpen: isOpen });
      const advCode = store.adventureCode();
      if (isOpen && advCode) {
        fetchSaves(advCode);
      }
    };

    const togglePauseMenu = (): void => {
      setPauseMenuOpen(!store.isPauseMenuOpen());
    };

    const startNewGame = rxMethod<string>(
      pipe(
        tap((adventureCode) =>
          patchState(store, {
            adventureCode,
            isLoading: true,
            feedbackMessage: null,
            endingMessage: null,
            isPauseMenuOpen: false,
            savesList: []
          })
        ),
        switchMap((adventureCode) =>
          gameService.startNewGame(adventureCode).pipe(
            switchMap((save) =>
              saveService.getSavesForAdventure(adventureCode).pipe(
                tap({
                  next: (savesList) => {
                    patchState(store, {
                      currentSaveCode: save.code,
                      gameState: save.gameState ?? null,
                      savesList,
                      isLoading: false
                    });
                    closeRadialMenu();
                  },
                  error: () => {
                    patchState(store, {
                      currentSaveCode: save.code,
                      gameState: save.gameState ?? null,
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
            endingMessage: null,
            isPauseMenuOpen: false
          })
        ),
        switchMap((adventureCode) =>
          gameService.continueGame(adventureCode).pipe(
            switchMap((save) =>
              saveService.getSavesForAdventure(adventureCode).pipe(
                tap({
                  next: (savesList) => {
                    patchState(store, {
                      currentSaveCode: save.code,
                      gameState: save.gameState ?? null,
                      savesList,
                      isLoading: false
                    });
                    closeRadialMenu();
                  },
                  error: () => {
                    patchState(store, {
                      currentSaveCode: save.code,
                      gameState: save.gameState ?? null,
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
            endingMessage: null,
            isPauseMenuOpen: false
          })
        ),
        switchMap((saveCode) =>
          gameService.loadGame(saveCode).pipe(
            tap({
              next: (save) => {
                patchState(store, {
                  currentSaveCode: save.code,
                  gameState: save.gameState ?? null,
                  isLoading: false
                });
                closeRadialMenu();
                const advCode = store.adventureCode();
                if (advCode) {
                  fetchSaves(advCode);
                }
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

    const executeAction = rxMethod<{ actionCode: string; actionType: ActionType }>(
      pipe(
        exhaustMap(({ actionCode, actionType }) => {
          const adventureCode = store.adventureCode();
          const gameState = store.gameState();

          if (!adventureCode || !gameState) {
            console.error('Nessuna partita attiva nello store');
            setFeedbackMessage('Errore: sessione di gioco non valida.');
            closeRadialMenu();
            return [];
          }

          const payload: GameActionDto = {
            adventureCode,
            gameState,
            actionCode,
            actionType
          };

          return actionService.executeAction(payload).pipe(
            tap({
              next: (result: GameActionResultDto) => {
                const completed = !!result.state?.completed;

                if (result.state) {
                  patchState(store, {
                    gameState: result.state,
                    endingMessage: completed ? result.feedbackMessage || null : null
                  });
                }

                if (!completed) {
                  setFeedbackMessage(
                    result.feedbackMessage || (result.success ? 'Azione eseguita.' : 'Non succede nulla.')
                  );
                }
                closeRadialMenu();
              },
              error: (err: any) => {
                console.error('Errore durante l\'esecuzione dell\'azione:', err);
                const msg =
                  err?.error?.feedbackMessage ||
                  err?.error?.message ||
                  err?.message ||
                  'Non puoi fare questa azione qui.';
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
          const advCode = store.adventureCode();
          const currentState = store.gameState();

          if (!advCode) {
            console.error('Nessuna avventura attiva da salvare');
            return [];
          }

          return saveService.createSave(advCode, currentState, saveName).pipe(
            tap({
              next: () => {
                setFeedbackMessage('Partita salvata con successo!');
                fetchSaves(advCode);
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

    const incrementPlayTime = (): void => {
      const state = store.gameState();
      if (!state || state.completed || store.isPauseMenuOpen()) {
        return;
      }
      patchState(store, {
        gameState: {
          ...state,
          playTime: (state.playTime ?? 0) + 1
        }
      });
    };

    const syncAutoSave = rxMethod<void>(
      pipe(
        switchMap(() => {
          const advCode = store.adventureCode();
          const currentState = store.gameState();
          if (!advCode || !currentState) {
            return [];
          }
          return saveService.updateAutoSave(advCode, currentState).pipe(
            tap({
              error: (err) => console.error('Errore sincronizzazione autosave:', err)
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
      syncAutoSave,
      incrementPlayTime,
      resetStore
    };
  })
);
