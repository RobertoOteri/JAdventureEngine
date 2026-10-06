package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.GameEffectMapper;
import com.jadventure.backend.mapper.PreconditionMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.repository.ActionRepository;
import com.jadventure.backend.repository.ItemRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ActionService {

    private final ActionRepository actionRepository;
    private final ItemRepository itemRepository;
    private final ActionMapper actionMapper;
    private final PreconditionMapper preconditionMapper;
    private final GameEffectMapper gameEffectMapper;

    public ActionService(ActionRepository actionRepository, ItemRepository itemRepository,
                         ActionMapper actionMapper, PreconditionMapper preconditionMapper,
                         GameEffectMapper gameEffectMapper) {
        this.actionRepository = actionRepository;
        this.itemRepository = itemRepository;
        this.actionMapper = actionMapper;
        this.preconditionMapper = preconditionMapper;
        this.gameEffectMapper = gameEffectMapper;
    }

    @Transactional(readOnly = true)
    public List<ActionDto> getActionsByItem(String adventureCode, String sceneCode, String itemCode) {
        Item item = findItemAndValidateHierarchy(adventureCode, sceneCode, itemCode);
        return actionMapper.toDtoList(actionRepository.findAllByItemCode(item.getCode()));
    }

    @Transactional(readOnly = true)
    public ActionDto getActionByCode(String adventureCode, String sceneCode, String itemCode, String actionCode) {
        Item item = findItemAndValidateHierarchy(adventureCode, sceneCode, itemCode);
        Action action = item.getActions().stream()
                .filter(a -> a.getCode().equals(actionCode))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata: " + actionCode));
        return actionMapper.toDto(action);
    }

    @Transactional
    public ActionDto addActionToItem(String adventureCode, String sceneCode, String itemCode, ActionDto dto) {
        Item item = findItemAndValidateHierarchy(adventureCode, sceneCode, itemCode);
        validateOwnership(item);

        if (item.getActions().stream().anyMatch(a -> a.getType() == dto.getType())) {
            throw new IllegalArgumentException("Azione " + dto.getType() + " già presente");
        }

        String actionCode = (dto.getCode() != null && !dto.getCode().isBlank())
                ? dto.getCode()
                : (dto.getType().name().toLowerCase() + "_" + itemCode);

        if (item.getActions().stream().anyMatch(a -> a.getCode().equals(actionCode))) {
            throw new IllegalArgumentException("Codice azione già esistente: " + actionCode);
        }

        Action action = Action.builder()
                .code(actionCode)
                .type(dto.getType())
                .successMessage(dto.getSuccessMessage())
                .defaultFailureMessage(dto.getDefaultFailureMessage())
                .item(item)
                .preconditions(new ArrayList<>())
                .effects(new ArrayList<>())
                .build();

        if (dto.getPreconditions() != null && !dto.getPreconditions().isEmpty()) {
            List<Precondition> preconditions = preconditionMapper.toEntityList(dto.getPreconditions());
            preconditions.forEach(p -> p.setAction(action));
            action.setPreconditions(preconditions);
        }

        if (dto.getEffects() != null && !dto.getEffects().isEmpty()) {
            List<GameEffect> effects = gameEffectMapper.toEntityList(dto.getEffects());
            effects.forEach(e -> e.setAction(action));
            action.setEffects(effects);
        }

        Action savedAction = actionRepository.save(action);
        item.getActions().add(savedAction);

        return actionMapper.toDto(savedAction);
    }

    @Transactional
    public void deleteAction(String adventureCode, String sceneCode, String itemCode, String actionCode) {
        Item item = findItemAndValidateHierarchy(adventureCode, sceneCode, itemCode);
        validateOwnership(item);

        Action action = item.getActions().stream()
                .filter(a -> a.getCode().equals(actionCode))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Azione non trovata: " + actionCode));

        item.getActions().remove(action);
        actionRepository.delete(action);
    }

    private Item findItemAndValidateHierarchy(String adventureCode, String sceneCode, String itemCode) {
        Item item = itemRepository.findBySceneCodeAndCode(sceneCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trovato: " + itemCode));

        if (!item.getScene().getGraphicAdventure().getCode().equals(adventureCode)) {
            throw new IllegalArgumentException("Gerarchia non valida");
        }

        return item;
    }

    private void validateOwnership(Item item) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && !item.getScene().getGraphicAdventure().getAuthor().getUsername().equals(auth.getName())) {
            throw new AccessDeniedException("Accesso negato");
        }
    }
}