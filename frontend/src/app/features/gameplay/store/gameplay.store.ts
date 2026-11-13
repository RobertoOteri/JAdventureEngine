import { inject, computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { GamePlayService } from '../../../core/services/game-play.service';
import { GameSaveService } from '../../../core/services/game-save.service';
import { ActionService } from '../../../core/services/action.service';
import { TranslationService } from '../../../core/i18n/translation.service';
import { DialogueService } from '../../../core/services/dialogue.service';
import {
  GameStateDto,
  GameActionDto,
  GameSaveDto,
  Item,
  ActionType,
  GameActionResultDto,
  DialogueNode
} from '../../../core/models';
import { TextBox, normalizeTextBox } from '../../../core/models/textbox.model';
import {apiErrorMessage} from '../../../core/utils/http-error.util';
import { NotificationService } from '../../../core/services/notification.service';

export interface RadialMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  item: Item | null;
}

export interface DraggedItemState {
  isDragging: boolean;
  item: Item | null;
  x: number;
  y: number;
  targetHoveredName: string | null;
  targetHoveredCode: string | null;
}

export interface InputOverlayState {
  actionCode: string;
  actionType: ActionType;
  box: TextBox;
  value: string;
}

export interface GameplayState {
  adventureId: number | null;
  currentSaveCode: string | null;
  gameState: GameStateDto | null;
  savesList: GameSaveDto[];
  areSavesLoaded: boolean;
  isLoading: boolean;
  feedbackMessage: string | null;
  endingMessage: string | null;
  isInventoryOpen: boolean;
  isPauseMenuOpen: boolean;
  inputOverlay: InputOverlayState | null;
  activeDialogue: DialogueNode | null;
  radialMenu: RadialMenuState;
  draggedItem: DraggedItemState;
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
  draggedItem: initialDraggedState
};

export const GameplayStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    currentScene: computed(() => store.gameState()?.currentScene ?? null),
    inventory: computed<Item[]>(() => store.gameState()?.inventory ?? []),
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
        feedbackTimer = setTimeout(() => {
          patchState(store, {feedbackMessage: null});
          feedbackTimer = null;
        }, durationMs);
      }
    };

    const closeRadialMenu = (): void => {
      patchState(store, {radialMenu: initialRadialState});
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

    const openInputOverlay = (
      actionCode: string,
      actionType: ActionType,
      box?: TextBox | null
    ): void => {
      patchState(store, {
        inputOverlay: {
          actionCode,
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
      patchState(store, (state) => ({isInventoryOpen: !state.isInventoryOpen}));
    };

    const setInventoryOpen = (isOpen: boolean): void => {
      patchState(store, {isInventoryOpen: isOpen});
    };

    const setAdventureId = (id: number): void => {
      patchState(store, {adventureId: id, savesList: [], areSavesLoaded: false});
    };

    const startDragItem = (item: Item, x: number, y: number): void => {
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

    const syncAutoSave = rxMethod<void>(
      pipe(
        switchMap(() => {
          const advId = store.adventureId();
          const currentState = store.gameState();
          if (!advId || !currentState) {
            return [];
          }
          return saveService.updateAutoSave(advId, currentState).pipe(
            tap({
              error: (err) => console.error('Errore sincronizzazione autosave:', err)
            })
          );
        })
      )
    );

    const setPauseMenuOpen = (isOpen: boolean): void => {
      if (isOpen) {
        syncAutoSave();
      }
      patchState(store, {isPauseMenuOpen: isOpen});
      const advId = store.adventureId();
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
            activeDialogue: null
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
            activeDialogue: null
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

    const executeAction = rxMethod<{ actionCode: string; actionType: ActionType; input?: string }>(
      pipe(
        exhaustMap(({actionCode, actionType, input}) => {
          const adventureId = store.adventureId();
          const gameState = store.gameState();

          if (!adventureId || !gameState) {
            console.error('Nessuna partita attiva nello store');
            setFeedbackMessage(i18n.t('gameplay.feedback.invalidSession'));
            closeRadialMenu();
            closeInputOverlay();
            return [];
          }

          const payload: GameActionDto = {
            adventureId,
            gameState,
            actionCode,
            actionType,
            input
          };

          return actionService.executeAction(payload).pipe(
            tap({
              next: (result: GameActionResultDto) => {
                const completed = !!result.state?.completed;

                if (result.state) {
                  patchState(store, {
                    gameState: result.state,
                    activeDialogue: completed ? null : (result.dialogue ?? null),
                    endingMessage: completed ? result.feedbackMessage || null : null
                  });
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
                console.error('Errore durante l\'esecuzione dell\'azione:', err);
                const msg =
                  err?.error?.feedbackMessage ||
                  apiErrorMessage(err, i18n) ||
                  i18n.t('gameplay.feedback.actionNotAllowed');
                setFeedbackMessage(msg);
                closeRadialMenu();

                if (store.inputOverlay()) {
                  setInputValue('');
                }
              }
            })
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

          return dialogueService.choose({adventureId, gameState, choiceId}).pipe(
            tap((result: GameActionResultDto) => {
              if (result.state) {
                const completed = !!result.state.completed;
                patchState(store, {
                  gameState: result.state,
                  activeDialogue: completed ? null : (result.dialogue ?? null)
                });
              }
            }),
            catchError((err: any) => {
              console.error('Errore durante la scelta del dialogo:', err);
              setFeedbackMessage(apiErrorMessage(err, i18n) || i18n.t('gameplay.feedback.dialogueError'));
              return EMPTY;
            })
          );
        })
      )
    );

    const closeDialogue = (): void => {
      const state = store.gameState();
      patchState(store, {
        activeDialogue: null,
        gameState: state ? {...state, currentDialogueNodeCode: null} : state
      });
    };

    const submitInput = (): void => {
      const overlay = store.inputOverlay();
      if (!overlay || !overlay.value.trim()) {
        return;
      }
      executeAction({
        actionCode: overlay.actionCode,
        actionType: overlay.actionType,
        input: overlay.value
      });
    };

    const dropOnSceneTarget = (targetItemCode: string): void => {
      const drag = store.draggedItem();
      if (!drag.isDragging || !drag.item) return;

      const sourceCode = drag.item.code;
      const sourceItem = drag.item;
      cancelDrag();

      const scene = store.gameState()?.currentScene;
      const targetHotspot = scene?.items?.find((i) => i.code === targetItemCode);

      let action = sourceItem?.actions?.find(
        (a) => a.type === 'USE_WITH' && a.targetItemCode === targetItemCode
      );

      if (!action) {
        action = targetHotspot?.actions?.find(
          (a) => a.type === 'USE_WITH' && a.targetItemCode === sourceCode
        );
      }

      const actionIdentifier = action?.code || (action?.id ? String(action.id) : null);

      if (action && actionIdentifier) {
        executeAction({actionCode: actionIdentifier, actionType: 'USE_WITH'});
      } else {
        setFeedbackMessage(i18n.t('gameplay.feedback.noEffect'));
      }
    };

    const dropOnInventoryTarget = (targetItemCode: string): void => {
      const drag = store.draggedItem();
      if (!drag.isDragging || !drag.item) return;

      const sourceCode = drag.item.code;
      cancelDrag();

      const inventory = store.gameState()?.inventory ?? [];
      const sourceItem = inventory.find((i) => i.code === sourceCode);
      const targetItem = inventory.find((i) => i.code === targetItemCode);

      const action =
        sourceItem?.actions?.find((a) => a.type === 'USE_WITH' && a.targetItemCode === targetItemCode) ||
        targetItem?.actions?.find((a) => a.type === 'USE_WITH' && a.targetItemCode === sourceCode);

      if (action?.code) {
        executeAction({actionCode: action.code, actionType: 'USE_WITH'});
      } else {
        setFeedbackMessage(i18n.t('gameplay.feedback.cannotCombine'));
      }
    };

    const saveCurrentGame = rxMethod<string | undefined>(
      pipe(
        switchMap((saveName) => {
          const advId = store.adventureId();
          const currentState = store.gameState();

          if (!advId) {
            console.error('Nessuna avventura attiva da salvare');
            return [];
          }

          return saveService.createSave(advId, currentState, saveName).pipe(
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
      syncAutoSave,
      incrementPlayTime,
      resetStore
    };
  })
);
