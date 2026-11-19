import { inject, computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, exhaustMap, Observable, of, pipe, shareReplay, switchMap, tap } from 'rxjs';
import { GamePlayService } from '../../../core/services/game-play.service';
import { GameSaveService } from '../../../core/services/game-save.service';
import { ActionService } from '../../../core/services/action.service';
import { TranslationService } from '../../../core/i18n/translation.service';
import { DialogueService } from '../../../core/services/dialogue.service';
import {
  GameViewDto,
  GameActionDto,
  GameSaveDto,
  GameItem,
  ActionType,
  GameActionResultDto,
  GameDialogue
} from '../../../core/models';
import { TextBox, normalizeTextBox } from '../../../core/models/textbox.model';
import {apiErrorMessage} from '../../../core/utils/http-error.util';
import { NotificationService } from '../../../core/services/notification.service';

export interface RadialMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  item: GameItem | null;
}

export interface DraggedItemState {
  isDragging: boolean;
  item: GameItem | null;
  x: number;
  y: number;
  targetHoveredName: string | null;
  targetHoveredCode: string | null;
}

export interface InputOverlayState {
  itemCode: string;
  actionType: ActionType;
  box: TextBox;
  value: string;
}

export interface GameplayState {
  adventureId: number | null;
  currentSaveCode: string | null;
  gameState: GameViewDto | null;
  savesList: GameSaveDto[];
  areSavesLoaded: boolean;
  isLoading: boolean;
  feedbackMessage: string | null;
  endingMessage: string | null;
  isInventoryOpen: boolean;
  isPauseMenuOpen: boolean;
  inputOverlay: InputOverlayState | null;
  activeDialogue: GameDialogue | null;
  radialMenu: RadialMenuState;
  draggedItem: DraggedItemState;
  pickedItems: GameItem[];
}

const initialRadialState: RadialMenuState = {
  isOpen: false,
  x: 0,
  y: 0,
  item: null
};

const initialDraggedState: DraggedItemState = {
  isDragging: false,
  item: null,
  x: 0,
  y: 0,
  targetHoveredName: null,
  targetHoveredCode: null
};

const initialState: GameplayState = {
  adventureId: null,
  currentSaveCode: null,
  gameState: null,
  savesList: [],
  areSavesLoaded: false,
  isLoading: false,
  feedbackMessage: null,
  endingMessage: null,
  isInventoryOpen: false,
  isPauseMenuOpen: false,
  inputOverlay: null,
  activeDialogue: null,
  radialMenu: initialRadialState,
  draggedItem: initialDraggedState,
  pickedItems: []
};

const newInventoryItems = (previous: GameViewDto | null, next: GameViewDto): GameItem[] => {
  const previousCodes = new Set((previous?.inventory ?? []).map((item) => item.code));
  return (next.inventory ?? []).filter((item) => !previousCodes.has(item.code));
};

export const GameplayStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    currentScene: computed(() => store.gameState()?.currentScene ?? null),
    inventory: computed<GameItem[]>(() => store.gameState()?.inventory ?? []),
    inventoryCount: computed(() => store.gameState()?.inventory?.length ?? 0),
    bagCount: computed(() => Math.max(0, (store.gameState()?.inventory?.length ?? 0) - store.pickedItems().length)),
    typedInput: computed(() => store.gameState()?.typedInput ?? ''),
    isCompleted: computed(() => store.gameState()?.completed ?? false),
    currentSceneBackgroundUrl: computed(() => {
      return store.gameState()?.currentScene?.backgroundImageUrl ?? '';
    })
  })),

  withMethods((
    store,
    gameService = inject(GamePlayService),
    saveService = inject(GameSaveService),
    actionService = inject(ActionService),
    dialogueService = inject(DialogueService),
    i18n = inject(TranslationService),
    notifications = inject(NotificationService)
  ) => {
    let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

    const setFeedbackMessage = (message: string | null, durationMs = 3500): void => {
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
        feedbackTimer = null;
      }
      patchState(store, {feedbackMessage: message});

      if (message) {
        patchState(store, {isInventoryOpen: false});
        feedbackTimer = setTimeout(() => {
          patchState(store, {feedbackMessage: null});
          feedbackTimer = null;
        }, durationMs);
      }
    };

    const closeRadialMenu = (): void => {
      patchState(store, {radialMenu: initialRadialState});
    };

    const openRadialMenu = (item: GameItem, x: number, y: number): void => {
      patchState(store, {
        radialMenu: {
          isOpen: true,
          x,
          y,
          item
        }
      });
    };

    const openInputOverlay = (
      itemCode: string,
      actionType: ActionType,
      box?: TextBox | null
    ): void => {
      patchState(store, {
        inputOverlay: {
          itemCode,
          actionType,
          box: normalizeTextBox(box),
          value: ''
        }
      });
      closeRadialMenu();
    };

    const closeInputOverlay = (): void => {
      if (store.inputOverlay()) {
        patchState(store, {inputOverlay: null});
      }
    };

    const setInputValue = (value: string): void => {
      const overlay = store.inputOverlay();
      if (overlay) {
        patchState(store, {inputOverlay: {...overlay, value}});
      }
    };

    const toggleInventory = (): void => {
      patchState(store, (state) => ({isInventoryOpen: !state.isInventoryOpen && !state.activeDialogue}));
    };

    const setInventoryOpen = (isOpen: boolean): void => {
      patchState(store, {isInventoryOpen: isOpen && !store.activeDialogue()});
    };

    const setAdventureId = (id: number): void => {
      patchState(store, {adventureId: id, savesList: [], areSavesLoaded: false});
    };

    const startDragItem = (item: GameItem, x: number, y: number): void => {
      patchState(store, {
        draggedItem: {
          isDragging: true,
          item,
          x,
          y,
          targetHoveredName: null,
          targetHoveredCode: null
        }
      });
    };

    const updateDragPosition = (x: number, y: number): void => {
      if (!store.draggedItem.isDragging()) return;
      patchState(store, {
        draggedItem: {
          ...store.draggedItem(),
          x,
          y
        }
      });
    };

    const setDragTarget = (name: string | null, code: string | null): void => {
      if (!store.draggedItem.isDragging()) return;
      patchState(store, {
        draggedItem: {
          ...store.draggedItem(),
          targetHoveredName: name,
          targetHoveredCode: code
        }
      });
    };

    const cancelDrag = (): void => {
      patchState(store, {draggedItem: initialDraggedState});
    };

    const fetchSaves = rxMethod<number>(
      pipe(
        switchMap((adventureId) =>
          saveService.getSavesForAdventure(adventureId).pipe(
            tap({
              next: (savesList) => patchState(store, {savesList, areSavesLoaded: true}),
              error: () => patchState(store, {areSavesLoaded: true})
            })
          )
        )
      )
    );

    let pendingDialogueClose: Observable<unknown> = of(null);

    const syncTimer = rxMethod<{ adventureId: number; paused: boolean }>(
      pipe(
        concatMap(({adventureId, paused}) =>
          (paused ? gameService.pauseGame(adventureId) : gameService.resumeGame(adventureId)).pipe(
            catchError(() => EMPTY)
          )
        )
      )
    );

    const pauseGame = (): void => {
      const advId = store.adventureId();
      if (advId && store.gameState()) {
        syncTimer({adventureId: advId, paused: true});
      }
    };

    const setPauseMenuOpen = (isOpen: boolean): void => {
      const advId = store.adventureId();
      if (advId && store.gameState()) {
        syncTimer({adventureId: advId, paused: isOpen});
      }
      patchState(store, {isPauseMenuOpen: isOpen});
      if (isOpen && advId) {
        fetchSaves(advId);
      }
    };

    const togglePauseMenu = (): void => {
      setPauseMenuOpen(!store.isPauseMenuOpen());
    };

    const startNewGame = rxMethod<number>(
      pipe(
        tap((adventureId) =>
          patchState(store, {
            adventureId,
            isLoading: true,
            feedbackMessage: null,
            endingMessage: null,
            isPauseMenuOpen: false,
            inputOverlay: null,
            activeDialogue: null,
            pickedItems: [],
            savesList: []
          })
        ),
        switchMap((adventureId) =>
          gameService.startNewGame(adventureId).pipe(
            switchMap((save) =>
              saveService.getSavesForAdventure(adventureId).pipe(
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
                patchState(store, {isLoading: false});
                notifications.httpError(err, 'gameplay.feedback.startError');
              }
            })
          )
        )
      )
    );

    const continueGame = rxMethod<number>(
      pipe(
        tap((adventureId) =>
          patchState(store, {
            adventureId,
            isLoading: true,
            feedbackMessage: null,
            endingMessage: null,
            isPauseMenuOpen: false,
            inputOverlay: null,
            activeDialogue: null,
            pickedItems: []
          })
        ),
        switchMap((adventureId) =>
          gameService.continueGame(adventureId).pipe(
            switchMap((save) =>
              saveService.getSavesForAdventure(adventureId).pipe(
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
                patchState(store, {isLoading: false});
                notifications.httpError(err, 'gameplay.feedback.noSaveToContinue');
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
            isPauseMenuOpen: false,
            inputOverlay: null,
            activeDialogue: null,
            pickedItems: []
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
                const advId = store.adventureId();
                if (advId) {
                  fetchSaves(advId);
                }
              },
              error: (err) => {
                patchState(store, {isLoading: false});
                notifications.httpError(err, 'gameplay.feedback.loadError');
              }
            })
          )
        )
      )
    );

    const executeAction = rxMethod<{
      itemCode: string;
      actionType: ActionType;
      targetItemCode?: string;
      input?: string;
      notFoundMessage?: string;
    }>(
      pipe(
        exhaustMap(({itemCode, actionType, targetItemCode, input, notFoundMessage}) => {
          const adventureId = store.adventureId();
          const gameState = store.gameState();

          if (!adventureId || !gameState) {
            setFeedbackMessage(i18n.t('gameplay.feedback.invalidSession'));
            closeRadialMenu();
            closeInputOverlay();
            return [];
          }

          const payload: GameActionDto = {
            adventureId,
            itemCode,
            actionType,
            targetItemCode,
            input
          };

          return pendingDialogueClose.pipe(
            switchMap(() => actionService.executeAction(payload)),
            tap({
              next: (result: GameActionResultDto) => {
                const completed = !!result.state?.completed;

                if (result.state) {
                  patchState(store, {
                    pickedItems: [...store.pickedItems(), ...newInventoryItems(store.gameState(), result.state)],
                    gameState: result.state,
                    activeDialogue: completed ? null : (result.dialogue ?? null),
                    endingMessage: completed ? result.feedbackMessage || null : null
                  });
                  if (store.activeDialogue()) {
                    setInventoryOpen(false);
                  }
                }

                if (!completed) {
                  setFeedbackMessage(
                    result.feedbackMessage || (result.success ? null : i18n.t('gameplay.feedback.preconditionFailed'))
                  );
                }
                closeRadialMenu();

                if (store.inputOverlay()) {
                  if (result.success || completed) {
                    closeInputOverlay();
                  } else {
                    setInputValue('');
                  }
                }
              },
              error: (err: any) => {
                const noCombination = !!notFoundMessage && err?.error?.code === 'error.action.useWithNotFound';
                const msg = noCombination
                  ? notFoundMessage
                  : err?.error?.feedbackMessage ||
                    apiErrorMessage(err, i18n) ||
                    i18n.t('gameplay.feedback.actionNotAllowed');
                setFeedbackMessage(msg);
                closeRadialMenu();

                if (store.inputOverlay()) {
                  setInputValue('');
                }
              }
            }),
            catchError(() => EMPTY)
          );
        })
      )
    );

    const chooseDialogueOption = rxMethod<number>(
      pipe(
        exhaustMap((choiceId) => {
          const adventureId = store.adventureId();
          const gameState = store.gameState();

          if (!adventureId || !gameState) {
            setFeedbackMessage(i18n.t('gameplay.feedback.invalidSession'));
            return EMPTY;
          }

          return dialogueService.choose({adventureId, choiceId}).pipe(
            tap((result: GameActionResultDto) => {
              if (result.state) {
                const completed = !!result.state.completed;
                patchState(store, {
                  pickedItems: [...store.pickedItems(), ...newInventoryItems(store.gameState(), result.state)],
                  gameState: result.state,
                  activeDialogue: completed ? null : (result.dialogue ?? null)
                });
                if (store.activeDialogue()) {
                  setInventoryOpen(false);
                }
              }
            }),
            catchError((err: any) => {
              setFeedbackMessage(apiErrorMessage(err, i18n) || i18n.t('gameplay.feedback.dialogueError'));
              return EMPTY;
            })
          );
        })
      )
    );

    const closeDialogue = (): void => {
      const state = store.gameState();
      const advId = store.adventureId();
      patchState(store, {activeDialogue: null});
      if (advId && state) {
        pendingDialogueClose = dialogueService.close(advId).pipe(
          catchError(() => of(null)),
          shareReplay(1)
        );
        pendingDialogueClose.subscribe();
      }
    };

    const submitInput = (): void => {
      const overlay = store.inputOverlay();
      if (!overlay || !overlay.value.trim()) {
        return;
      }
      executeAction({
        itemCode: overlay.itemCode,
        actionType: overlay.actionType,
        input: overlay.value
      });
    };

    const dropOnSceneTarget = (targetItemCode: string): void => {
      const drag = store.draggedItem();
      if (!drag.isDragging || !drag.item) return;

      const sourceCode = drag.item.code;
      cancelDrag();

      executeAction({
        itemCode: sourceCode,
        actionType: 'USE_WITH',
        targetItemCode,
        notFoundMessage: i18n.t('gameplay.feedback.noEffect')
      });
    };

    const dropOnInventoryTarget = (targetItemCode: string): void => {
      const drag = store.draggedItem();
      if (!drag.isDragging || !drag.item) return;

      const sourceCode = drag.item.code;
      cancelDrag();

      executeAction({
        itemCode: sourceCode,
        actionType: 'USE_WITH',
        targetItemCode,
        notFoundMessage: i18n.t('gameplay.feedback.cannotCombine')
      });
    };

    const saveCurrentGame = rxMethod<string | undefined>(
      pipe(
        switchMap((saveName) => {
          const advId = store.adventureId();

          if (!advId) {
            return [];
          }

          return saveService.createSave(advId, saveName).pipe(
            tap({
              next: () => {
                notifications.success(i18n.t('gameplay.feedback.saved'));
                fetchSaves(advId);
              },
              error: (err) => {
                notifications.httpError(err, 'gameplay.feedback.saveError');
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

    const shiftPickedItem = (): void => {
      patchState(store, (state) => ({pickedItems: state.pickedItems.slice(1)}));
    };

    const resetStore = (): void => {
      patchState(store, initialState);
    };

    return {
      setFeedbackMessage,
      openRadialMenu,
      closeRadialMenu,
      openInputOverlay,
      closeInputOverlay,
      setInputValue,
      submitInput,
      toggleInventory,
      setInventoryOpen,
      startDragItem,
      updateDragPosition,
      setDragTarget,
      cancelDrag,
      dropOnSceneTarget,
      dropOnInventoryTarget,
      togglePauseMenu,
      setPauseMenuOpen,
      setAdventureId,
      startNewGame,
      continueGame,
      loadGame,
      fetchSaves,
      executeAction,
      chooseDialogueOption,
      closeDialogue,
      saveCurrentGame,
      pauseGame,
      incrementPlayTime,
      shiftPickedItem,
      resetStore
    };
  })
);
