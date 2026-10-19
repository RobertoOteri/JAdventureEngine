package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.repository.ActionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
public class ActionService {

    private final ActionRepository actionRepository;
    private final ActionMapper actionMapper;
    private final PreconditionService preconditionService;
    private final GameEffectService gameEffectService;
    private final GameSaveService gameSaveService;
    private final AuthService authService;

    public ActionService(ActionRepository actionRepository,
                         ActionMapper actionMapper,
                         PreconditionService preconditionService,
                         GameEffectService gameEffectService,
                         GameSaveService gameSaveService,
                         AuthService authService) {
        this.actionRepository = actionRepository;
        this.actionMapper = actionMapper;
        this.preconditionService = preconditionService;
        this.gameEffectService = gameEffectService;
        this.gameSaveService = gameSaveService;
        this.authService = authService;
    }

    @Transactional
    public GameActionResultDto executeAction(GameActionDto gameActionDto) {
        String adventureCode = gameActionDto.getAdventureCode();
        GameStateDto stateDto = gameActionDto.getGameState();

        if (adventureCode == null || stateDto == null || stateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco o codice avventura mancante");
        }

        if (stateDto.isCompleted()) {
            throw new IllegalArgumentException("L'avventura è già conclusa");
        }

        Action actionEntity = actionRepository.findByCode(gameActionDto.getActionCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Azione non trovata con codice: " + gameActionDto.getActionCode()
                ));

        ActionDto action = actionMapper.toDto(actionEntity);

        if (action.getType() != gameActionDto.getActionType()) {
            throw new IllegalArgumentException(
                    "Tipo di azione non corrispondente: atteso " + action.getType() + " ma ricevuto " + gameActionDto.getActionType()
            );
        }

        Optional<String> failureMessage = preconditionService.validatePreconditions(stateDto, action);

        if (failureMessage.isPresent()) {
            return GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(stateDto)
                    .build();
        }

        gameEffectService.applyAll(adventureCode, stateDto, action.getEffects());

        if (!stateDto.isCompleted()) {
            gameSaveService.updateAutoSave(adventureCode, stateDto);
        }

        String successMessage = StringUtils.hasText(action.getSuccessMessage())
                ? action.getSuccessMessage()
                : "Azione eseguita con successo.";

        return GameActionResultDto.builder()
                .success(true)
                .feedbackMessage(successMessage)
                .state(stateDto)
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