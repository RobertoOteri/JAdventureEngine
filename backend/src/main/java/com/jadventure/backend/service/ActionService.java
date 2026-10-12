package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.item.ItemDto;
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
    private final ItemService itemService;
    private final GraphicAdventureService graphicAdventureService;
    private final GameSaveService gameSaveService;
    private final GamePlayService gamePlayService;
    private final AuthService authService;

    public ActionService(ActionRepository actionRepository,
                         ActionMapper actionMapper,
                         PreconditionService preconditionService,
                         GameEffectService gameEffectService,
                         ItemService itemService,
                         GraphicAdventureService graphicAdventureService,
                         GameSaveService gameSaveService,
                         GamePlayService gamePlayService,
                         AuthService authService) {
        this.actionRepository = actionRepository;
        this.actionMapper = actionMapper;
        this.preconditionService = preconditionService;
        this.gameEffectService = gameEffectService;
        this.itemService = itemService;
        this.graphicAdventureService = graphicAdventureService;
        this.gameSaveService = gameSaveService;
        this.gamePlayService = gamePlayService;
        this.authService = authService;
    }

    @Transactional
    public GameActionResultDto executeAction(GameActionDto actionDto) {
        GameSave save = gameSaveService.findSaveByUser(actionDto.getSaveCode());

        Action action = actionRepository.findByItemCodeAndType(actionDto.getItemCode(), actionDto.getActionType())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Azione '" + actionDto.getActionType() + "' non trovata per l'item: " + actionDto.getItemCode()
                ));

        Optional<String> failureMessage = preconditionService.validatePreconditions(save, action);

        if (failureMessage.isPresent()) {
            return GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(gamePlayService.buildGameState(save))
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
                .state(gamePlayService.buildGameState(save))
                .build();
    }

    @Transactional(readOnly = true)
    public List<ActionDto> getActionsByItem(String itemCode) {
        return actionMapper.toDtoList(actionRepository.findAllByItemCode(itemCode));
    }

    @Transactional(readOnly = true)
    public ActionDto getActionByCode(String actionCode) {
        Action action = actionRepository.findByCode(actionCode)
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata: " + actionCode));
        return actionMapper.toDto(action);
    }

    @Transactional
    public ActionDto addActionToItem(String adventureCode, String sceneCode, String itemCode, ActionDto dto) {
        ItemDto itemDto = itemService.getItemByCode(adventureCode, sceneCode, itemCode);
        authService.validateOwnership(graphicAdventureService.getAdventureByCode(adventureCode).getAuthorUsername());

        if (actionRepository.existsByItemCodeAndType(itemCode, dto.getType())) {
            throw new IllegalArgumentException("Azione " + dto.getType() + " già presente per l'item: " + itemCode);
        }

        String actionCode = (dto.getCode() != null && !dto.getCode().isBlank())
                ? dto.getCode()
                : (dto.getType().name().toLowerCase() + "_" + itemCode);

        if (actionRepository.existsByItemCodeAndCode(itemCode, actionCode)) {
            throw new IllegalArgumentException("Codice azione già esistente: " + actionCode);
        }

        dto.setCode(actionCode);

        Action action = actionMapper.toEntity(dto, itemDto);

        if (action.getPreconditions() != null) {
            action.getPreconditions().forEach(p -> p.setAction(action));
        }
        if (action.getEffects() != null) {
            action.getEffects().forEach(e -> e.setAction(action));
        }

        return actionMapper.toDto(actionRepository.save(action));
    }

    @Transactional
    public void deleteAction(String actionCode) {
        Action action = actionRepository.findByCode(actionCode)
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata: " + actionCode));

        authService.validateOwnership(action.getItem().getScene().getGraphicAdventure().getAuthor().getUsername());

        actionRepository.delete(action);
    }
}