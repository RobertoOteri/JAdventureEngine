package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.repository.ActionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ActionService {

    private final ActionRepository actionRepository;
    private final ActionMapper actionMapper;
    private final PreconditionService preconditionService;
    private final GameEffectService gameEffectService;
    private final GameSaveService gameSaveService;
    private final GamePlayService gamePlayService;
    private final AuthService authService;

    public ActionService(ActionRepository actionRepository,
                         ActionMapper actionMapper,
                         PreconditionService preconditionService,
                         GameEffectService gameEffectService,
                         GameSaveService gameSaveService,
                         GamePlayService gamePlayService,
                         AuthService authService) {
        this.actionRepository = actionRepository;
        this.actionMapper = actionMapper;
        this.preconditionService = preconditionService;
        this.gameEffectService = gameEffectService;
        this.gameSaveService = gameSaveService;
        this.gamePlayService = gamePlayService;
        this.authService = authService;
    }

    @Transactional
    public GameActionResultDto executeAction(GameActionDto actionDto) {
        GameSave save = gameSaveService.findSaveByUser(actionDto.getSaveCode());

        Action action = actionRepository.findByCode(actionDto.getActionCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Azione non trovata con codice: " + actionDto.getActionCode()
                ));

        if (action.getType() != actionDto.getActionType()) {
            throw new IllegalArgumentException(
                    "Tipo di azione non corrispondente: atteso " + action.getType() + " ma ricevuto " + actionDto.getActionType()
            );
        }

        Optional<String> failureMessage = preconditionService.validatePreconditions(
                save.getInventory(),
                save.getAdventureFlags(),
                action
        );

        if (failureMessage.isPresent()) {
            return GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(gamePlayService.buildGameSaveDto(save).getGameState())
                    .build();
        }

        gameEffectService.applyAll(save, action.getEffects());
        gameSaveService.save(save);

        String successMessage = (action.getSuccessMessage() != null && !action.getSuccessMessage().isBlank())
                ? action.getSuccessMessage()
                : "Azione eseguita con successo.";

        return GameActionResultDto.builder()
                .success(true)
                .feedbackMessage(successMessage)
                .state(gamePlayService.buildGameSaveDto(save).getGameState())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ActionDto> getActionsByItemId(Long itemId) {
        return actionMapper.toDtoList(actionRepository.findAllByItemId(itemId));
    }

    @Transactional(readOnly = true)
    public ActionDto getActionById(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata con ID: " + actionId));
        return actionMapper.toDto(action);
    }

    @Transactional
    public ActionDto updateAction(ActionDto dto) {
        Action action = actionRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata con ID: " + dto.getId()));

        authService.validateOwnership(action.getItem().getScene().getGraphicAdventure().getAuthor().getUsername());

        actionMapper.updateEntityFromDto(dto, action);

        return actionMapper.toDto(actionRepository.save(action));
    }

    @Transactional
    public void deleteActionById(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata con ID: " + actionId));

        authService.validateOwnership(action.getItem().getScene().getGraphicAdventure().getAuthor().getUsername());
        action.getItem().getActions().remove(action);

        actionRepository.delete(action);
    }
}