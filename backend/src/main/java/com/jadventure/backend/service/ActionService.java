package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.DialogueNodeMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.enums.ActionType;
import com.jadventure.backend.repository.ActionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class ActionService {

    private final ActionRepository actionRepository;
    private final ActionMapper actionMapper;
    private final PreconditionService preconditionService;
    private final ItemService itemService;
    private final GameEffectService gameEffectService;
    private final GameSaveService gameSaveService;
    private final DialogueGameService dialogueGameService;
    private final AuthService authService;
    private final DialogueNodeMapper dialogueNodeMapper;

    @Transactional
    public GameActionResultDto executeAction(GameActionDto gameActionDto) {
        log.info("Executing executeAction with itemCode: {}, actionType: {}, targetItemCode: {}, adventureId: {}",
                gameActionDto.getItemCode(), gameActionDto.getActionType(), gameActionDto.getTargetItemCode(), gameActionDto.getAdventureId());
        Long adventureId = gameActionDto.getAdventureId();
        GameStateDto stateDto = gameSaveService.loadActiveState(adventureId);

        if (stateDto.isCompleted()) {
            log.error("Cannot execute action on item {}: the game of adventure {} has already ended", gameActionDto.getItemCode(), adventureId);
            throw new InvalidOperationException("error.game.alreadyEnded");
        }

        if (stateDto.getCurrentDialogueNodeCode() != null) {
            log.error("Cannot execute action on item {}: dialogue {} is in progress", gameActionDto.getItemCode(), stateDto.getCurrentDialogueNodeCode());
            throw new InvalidOperationException("error.action.duringDialogue");
        }

        ActionDto action = actionMapper.toDto(findPlayableAction(adventureId, stateDto, gameActionDto));

        Optional<String> failureMessage = preconditionService.validatePreconditions(stateDto, action, gameActionDto.getInput());

        if (failureMessage.isPresent()) {
            gameSaveService.updateAutoSave(adventureId, stateDto);
            GameActionResultDto failedResult = GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(gameSaveService.toView(stateDto))
                    .build();
            log.info("Executed executeAction for action {}: preconditions not satisfied, success: false", action.getCode());
            return failedResult;
        }

        gameEffectService.applyAll(adventureId, stateDto, action.getEffects());

        DialogueNodeDto dialogue = dialogueGameService.openCurrentNode(adventureId, stateDto);

        if (!stateDto.isCompleted()) {
            gameSaveService.updateAutoSave(adventureId, stateDto);
        }

        String successMessage = StringUtils.hasText(action.getSuccessMessage())
                ? action.getSuccessMessage()
                : null;

        GameActionResultDto result = GameActionResultDto.builder()
                .success(true)
                .feedbackMessage(successMessage)
                .state(gameSaveService.toView(stateDto))
                .dialogue(dialogueNodeMapper.toGameDto(dialogue))
                .build();
        log.info("Executed executeAction for action {}: success: true, currentScene: {}, dialogueOpened: {}, completed: {}",
                action.getCode(), stateDto.getCurrentScene(), dialogue != null, stateDto.isCompleted());
        return result;
    }

    private Action findPlayableAction(Long adventureId, GameStateDto state, GameActionDto request) {
        String itemCode = request.getItemCode();
        ActionType type = request.getActionType();

        if (type != ActionType.USE_WITH) {
            if (!isVisibleInScene(state, itemCode)) {
                log.error("Item {} is not visible in scene {}", itemCode, state.getCurrentScene().getCode());
                throw new InvalidOperationException("error.action.itemNotReachable", itemCode);
            }
            return actionRepository.findFirstByItemCodeAndTypeAndItemGraphicAdventureId(itemCode, type, adventureId)
                    .orElseThrow(() -> {
                        log.error("Action {} not found for item {} in adventure {}", type, itemCode, adventureId);
                        return new ResourceNotFoundException("error.action.notFoundForItem", type, itemCode);
                    });
        }

        String targetCode = request.getTargetItemCode();
        if (!isInInventory(state, itemCode)
                || !StringUtils.hasText(targetCode)
                || !(isInInventory(state, targetCode) || isVisibleInScene(state, targetCode))) {
            log.error("Cannot use item {} with {}: one of them is not reachable", itemCode, targetCode);
            throw new InvalidOperationException("error.action.itemNotReachable", itemCode);
        }

        return actionRepository
                .findFirstByItemCodeAndTypeAndTargetItemCodeAndItemGraphicAdventureId(itemCode, type, targetCode, adventureId)
                .or(() -> actionRepository
                        .findFirstByItemCodeAndTypeAndTargetItemCodeAndItemGraphicAdventureId(targetCode, type, itemCode, adventureId))
                .orElseThrow(() -> {
                    log.info("No USE_WITH action between {} and {} in adventure {}", itemCode, targetCode, adventureId);
                    return new InvalidOperationException("error.action.useWithNotFound");
                });
    }

    private boolean isInInventory(GameStateDto state, String itemCode) {
        return state.getInventory() != null && state.getInventory().stream()
                .anyMatch(item -> item.getCode().equals(itemCode));
    }

    private boolean isVisibleInScene(GameStateDto state, String itemCode) {
        return state.getVisibleItemCodes() != null && state.getVisibleItemCodes().contains(itemCode)
                && state.getCurrentScene().getItems() != null
                && state.getCurrentScene().getItems().stream().anyMatch(item -> item.getCode().equals(itemCode));
    }

    @Transactional(readOnly = true)
    public List<ActionDto> getActionsByItemId(Long itemId) {
        log.info("Executing getActionsByItemId with itemId: {}", itemId);
        List<Action> entities = actionRepository.findAllByItemId(itemId);
        entities.stream().findFirst().ifPresent(action ->
                authService.validateOwnership(action.getItem().getGraphicAdventure().getAuthor().getUsername()));
        List<ActionDto> actions = actionMapper.toDtoList(entities);
        log.info("Executed getActionsByItemId: found {} actions for item {}", actions.size(), itemId);
        return actions;
    }

    @Transactional(readOnly = true)
    public ActionDto getActionById(Long actionId) {
        log.info("Executing getActionById with actionId: {}", actionId);
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> {
                    log.error("Action with id {} not found", actionId);
                    return new ResourceNotFoundException("error.action.notFoundById", actionId);
                });
        authService.validateOwnership(action.getItem().getGraphicAdventure().getAuthor().getUsername());
        ActionDto actionDto = actionMapper.toDto(action);
        log.info("Executed getActionById: returning action {}", actionDto);
        return actionDto;
    }

    @Transactional
    public ActionDto updateAction(ActionDto dto) {
        log.info("Executing updateAction with action: {}", dto);
        Action action = actionRepository.findById(dto.getId())
                .orElseThrow(() -> {
                    log.error("Action with id {} not found", dto.getId());
                    return new ResourceNotFoundException("error.action.notFoundById", dto.getId());
                });

        authService.validateEditable(
                action.getItem().getGraphicAdventure().getAuthor().getUsername(),
                action.getItem().getGraphicAdventure().getStatus());

        itemService.validateActionUniqueness(action.getItem().getActions(), dto, action.getId());
        itemService.validateAppendInputEffects(action.getItem().getGraphicAdventure().getId(), dto);
        actionMapper.updateEntityFromDto(dto, action);

        ActionDto updated = actionMapper.toDto(actionRepository.save(action));
        log.info("Executed updateAction: returning action {}", updated);
        return updated;
    }

    @Transactional
    public void deleteActionById(Long actionId) {
        log.info("Executing deleteActionById with actionId: {}", actionId);
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> {
                    log.error("Action with id {} not found", actionId);
                    return new ResourceNotFoundException("error.action.notFoundById", actionId);
                });

        authService.validateEditable(
                action.getItem().getGraphicAdventure().getAuthor().getUsername(),
                action.getItem().getGraphicAdventure().getStatus());
        action.getItem().getActions().remove(action);

        actionRepository.delete(action);
        log.info("Executed deleteActionById: action {} deleted", actionId);
    }
}
