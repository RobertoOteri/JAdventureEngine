package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.repository.ActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
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
        Long adventureId = gameActionDto.getAdventureId();
        GameStateDto stateDto = gameActionDto.getGameState();

        if (adventureId == null || stateDto == null || stateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco o avventura mancante");
        }

        if (stateDto.isCompleted()) {
            throw new IllegalArgumentException("L'avventura è già conclusa");
        }

        if (stateDto.getCurrentDialogueNodeCode() != null) {
            throw new IllegalArgumentException("Non puoi compiere azioni durante un dialogo");
        }

        Action actionEntity = actionRepository.findByCodeAndItemGraphicAdventureId(gameActionDto.getActionCode(), adventureId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Azione non trovata con codice: " + gameActionDto.getActionCode()
                ));

        ActionDto action = actionMapper.toDto(actionEntity);

        if (action.getType() != gameActionDto.getActionType()) {
            throw new IllegalArgumentException(
                    "Tipo di azione non corrispondente: atteso " + action.getType() + " ma ricevuto " + gameActionDto.getActionType()
            );
        }

        Optional<String> failureMessage = preconditionService.validatePreconditions(stateDto, action, gameActionDto.getInput());

        if (failureMessage.isPresent()) {
            return GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(stateDto)
                    .build();
        }

        gameEffectService.applyAll(adventureId, stateDto, action.getEffects());

        DialogueNodeDto dialogue = dialogueGameService.openCurrentNode(adventureId, stateDto);

        if (!stateDto.isCompleted()) {
            gameSaveService.updateAutoSave(adventureId, stateDto);
        }

        String successMessage = StringUtils.hasText(action.getSuccessMessage())
                ? action.getSuccessMessage()
                : "Azione eseguita con successo.";

        return GameActionResultDto.builder()
                .success(true)
                .feedbackMessage(successMessage)
                .state(stateDto)
                .dialogue(dialogue)
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

        authService.validateEditable(
                action.getItem().getGraphicAdventure().getAuthor().getUsername(),
                action.getItem().getGraphicAdventure().getStatus());

        itemService.validateActionUniqueness(action.getItem().getActions(), dto);

        actionMapper.updateEntityFromDto(dto, action);

        return actionMapper.toDto(actionRepository.save(action));
    }

    @Transactional
    public void deleteActionById(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata con ID: " + actionId));

        authService.validateEditable(
                action.getItem().getGraphicAdventure().getAuthor().getUsername(),
                action.getItem().getGraphicAdventure().getStatus());
        action.getItem().getActions().remove(action);

        actionRepository.delete(action);
    }
}