package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.model.Action;
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

    @Transactional
    public GameActionResultDto executeAction(GameActionDto gameActionDto) {
        log.info("Executing executeAction with actionCode: {}, actionType: {}, adventureId: {}",
                gameActionDto.getActionCode(), gameActionDto.getActionType(), gameActionDto.getAdventureId());
        Long adventureId = gameActionDto.getAdventureId();
        GameStateDto stateDto = gameActionDto.getGameState();

        if (adventureId == null || stateDto == null || stateDto.getCurrentScene() == null) {
            log.error("Cannot execute action {}: game state or adventure id is missing", gameActionDto.getActionCode());
            throw new InvalidOperationException("error.game.stateOrAdventureMissing");
        }

        if (stateDto.isCompleted()) {
            log.error("Cannot execute action {}: the game of adventure {} has already ended", gameActionDto.getActionCode(), adventureId);
            throw new InvalidOperationException("error.game.alreadyEnded");
        }

        if (stateDto.getCurrentDialogueNodeCode() != null) {
            log.error("Cannot execute action {}: dialogue {} is in progress", gameActionDto.getActionCode(), stateDto.getCurrentDialogueNodeCode());
            throw new InvalidOperationException("error.action.duringDialogue");
        }

        Action actionEntity = actionRepository.findByCodeAndItemGraphicAdventureId(gameActionDto.getActionCode(), adventureId)
                .orElseThrow(() -> {
                    log.error("Action with code {} not found in adventure {}", gameActionDto.getActionCode(), adventureId);
                    return new ResourceNotFoundException("error.action.notFoundByCode", gameActionDto.getActionCode());
                });

        ActionDto action = actionMapper.toDto(actionEntity);

        if (action.getType() != gameActionDto.getActionType()) {
            log.error("Action type mismatch for action {}: expected {}, received {}",
                    action.getCode(), action.getType(), gameActionDto.getActionType());
            throw new InvalidOperationException("error.action.typeMismatch", action.getType(), gameActionDto.getActionType());
        }

        Optional<String> failureMessage = preconditionService.validatePreconditions(stateDto, action, gameActionDto.getInput());

        if (failureMessage.isPresent()) {
            GameActionResultDto failedResult = GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(stateDto)
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
                .state(stateDto)
                .dialogue(dialogue)
                .build();
        log.info("Executed executeAction for action {}: success: true, currentScene: {}, dialogueOpened: {}, completed: {}",
                action.getCode(), stateDto.getCurrentScene(), dialogue != null, stateDto.isCompleted());
        return result;
    }

    @Transactional(readOnly = true)
    public List<ActionDto> getActionsByItemId(Long itemId) {
        log.info("Executing getActionsByItemId with itemId: {}", itemId);
        List<ActionDto> actions = actionMapper.toDtoList(actionRepository.findAllByItemId(itemId));
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

        itemService.validateActionUniqueness(action.getItem().getActions(), dto);

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
