package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.item.HotspotDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.ConflictException;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Hotspot;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.enums.ActionType;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.model.enums.PreconditionType;
import com.jadventure.backend.repository.ItemRepository;
import com.jadventure.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Log4j2
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;
    private final ActionMapper actionMapper;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public void validateCodeAvailable(Long adventureId, String code) {
        if (itemRepository.existsByGraphicAdventureIdAndCode(adventureId, code)) {
            log.error("Item code {} already in use in adventure {}", code, adventureId);
            throw new ConflictException("error.item.codeTaken", code);
        }
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getAdventureItems(Long adventureId) {
        log.info("Executing getAdventureItems with adventureId: {}", adventureId);
        List<Item> entities = itemRepository.findAllByGraphicAdventureId(adventureId);
        entities.stream().findFirst().ifPresent(item ->
                authService.validateOwnership(item.getGraphicAdventure().getAuthor().getUsername()));
        List<ItemDto> items = itemMapper.toDtoList(entities);
        log.info("Executed getAdventureItems: found {} items for adventure {}", items.size(), adventureId);
        return items;
    }

    @Transactional(readOnly = true)
    public ItemDto getItemById(Long itemId) {
        log.info("Executing getItemById with itemId: {}", itemId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.error("Item with id {} not found", itemId);
                    return new ResourceNotFoundException("error.item.notFoundById", itemId);
                });
        authService.validateOwnership(item.getGraphicAdventure().getAuthor().getUsername());
        ItemDto itemDto = itemMapper.toDto(item);
        log.info("Executed getItemById: returning item {} with code {}", itemDto.getId(), itemDto.getCode());
        return itemDto;
    }

    @Transactional
    public ItemDto updateItem(ItemDto dto, MultipartFile image) {
        log.info("Executing updateItem with itemId: {}, image provided: {}", dto.getId(), image != null && !image.isEmpty());
        Item item = itemRepository.findById(dto.getId())
                .orElseThrow(() -> {
                    log.error("Item with id {} not found", dto.getId());
                    return new ResourceNotFoundException("error.item.notFoundById", dto.getId());
                });

        GraphicAdventure adventure = item.getGraphicAdventure();
        authService.validateEditable(adventure.getAuthor().getUsername(), adventure.getStatus());

        copyItemProperties(item, dto);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE,
                    adventure.getCode(), adventure.getVersionNumber(), item.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        }

        ItemDto updated = itemMapper.toDto(itemRepository.save(item));
        log.info("Executed updateItem: item {} updated with code {}", updated.getId(), updated.getCode());
        return updated;
    }

    @Transactional
    public void deleteItemById(Long itemId) {
        log.info("Executing deleteItemById with itemId: {}", itemId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.error("Item with id {} not found", itemId);
                    return new ResourceNotFoundException("error.item.notFoundById", itemId);
                });

        authService.validateEditable(
                item.getGraphicAdventure().getAuthor().getUsername(),
                item.getGraphicAdventure().getStatus());
        itemRepository.delete(item);
        log.info("Executed deleteItemById: item {} deleted", itemId);
    }

    @Transactional
    public ActionDto addAction(Long itemId, ActionDto actionDto) {
        log.info("Executing addAction with itemId: {}, action: {}", itemId, actionDto);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.error("Item with id {} not found", itemId);
                    return new ResourceNotFoundException("error.item.notFoundById", itemId);
                });

        authService.validateEditable(
                item.getGraphicAdventure().getAuthor().getUsername(),
                item.getGraphicAdventure().getStatus());

        validateActionUniqueness(item.getActions(), actionDto, null);
        validateAppendInputEffects(item.getGraphicAdventure().getId(), actionDto);

        Action action = actionMapper.toEntity(actionDto);
        action.setItem(item);
        item.getActions().add(action);

        itemRepository.flush();

        ActionDto created = actionMapper.toDto(action);
        log.info("Executed addAction: returning action {} added to item {}", created, itemId);
        return created;
    }

    @Transactional(readOnly = true)
    public List<ItemDto> loadPlayerInventory(Long adventureId, Collection<String> itemCodes) {
        log.info("Executing loadPlayerInventory with adventureId: {}, itemCodes: {}", adventureId, itemCodes);
        if (itemCodes == null || itemCodes.isEmpty()) {
            log.info("Executed loadPlayerInventory: no item codes, returning empty inventory");
            return Collections.emptyList();
        }
        List<ItemDto> inventory = itemMapper.toDtoList(
                itemRepository.findAllByGraphicAdventureIdAndCodeIn(adventureId, itemCodes)
        );
        log.info("Executed loadPlayerInventory: returning {} items", inventory.size());
        return inventory;
    }

    public void validateActionUniqueness(List<Action> existingActions, ActionDto actionDto, Long excludedActionId) {
        log.debug("Executing validateActionUniqueness with action: {}, excludedActionId: {}", actionDto, excludedActionId);

        List<Action> otherActions = existingActions.stream()
                .filter(a -> excludedActionId == null || !excludedActionId.equals(a.getId()))
                .toList();

        if (actionDto.getType() == ActionType.USE_WITH) {
            if (actionDto.getTargetItemCode() == null || actionDto.getTargetItemCode().isBlank()) {
                log.error("Invalid USE_WITH action: target item code is required");
                throw new InvalidOperationException("error.action.useWithTargetRequired");
            }
            boolean duplicateUseWith = otherActions.stream()
                    .anyMatch(a -> a.getType() == ActionType.USE_WITH
                            && actionDto.getTargetItemCode().equalsIgnoreCase(a.getTargetItemCode()));
            if (duplicateUseWith) {
                log.error("Duplicate USE_WITH action for target item {}", actionDto.getTargetItemCode());
                throw new InvalidOperationException("error.action.duplicateUseWith", actionDto.getTargetItemCode());
            }
        } else {
            boolean typeAlreadyUsed = otherActions.stream()
                    .anyMatch(existing -> existing.getType() == actionDto.getType());
            if (typeAlreadyUsed) {
                log.error("Duplicate action: the item already has an action of type {}", actionDto.getType());
                throw new InvalidOperationException("error.action.duplicateType", actionDto.getType());
            }
        }
        log.debug("Executed validateActionUniqueness: action is unique");
    }

    public void validateAppendInputEffects(Long adventureId, ActionDto actionDto) {
        log.debug("Executing validateAppendInputEffects for action type {} in adventure {}", actionDto.getType(), adventureId);
        if (actionDto.getEffects() == null) {
            return;
        }

        actionDto.getEffects().stream()
                .filter(effect -> effect.getType() == EffectType.APPEND_INPUT)
                .forEach(effect -> {
                    if (effect.getFlagValue() == null || effect.getFlagValue().isEmpty()) {
                        log.error("Invalid APPEND_INPUT effect: the value to append is missing");
                        throw new InvalidOperationException("error.action.appendInputValueRequired");
                    }

                    String targetCode = effect.getTargetValue();
                    boolean targetHasInput = targetCode != null && itemRepository
                            .findAllByGraphicAdventureIdAndCodeIn(adventureId, Set.of(targetCode))
                            .stream()
                            .flatMap(item -> item.getActions().stream())
                            .flatMap(action -> action.getPreconditions().stream())
                            .anyMatch(precondition -> precondition.getType() == PreconditionType.INPUT_EQUALS);

                    if (!targetHasInput) {
                        log.error("Invalid APPEND_INPUT effect: item {} has no action with an INPUT_EQUALS precondition", targetCode);
                        throw new InvalidOperationException("error.action.appendInputTargetInvalid", targetCode);
                    }
                });
        log.debug("Executed validateAppendInputEffects: all APPEND_INPUT effects are valid");
    }

    private void copyItemProperties(Item item, ItemDto dto) {
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());

        HotspotDto hotspotDto = dto.getHotspot();
        if (hotspotDto != null) {
            Hotspot hotspot = item.getHotspot() != null ? item.getHotspot() : new Hotspot();
            hotspot.setPoints(hotspotDto.getPoints());
            hotspot.setPosX(hotspotDto.getPosX());
            hotspot.setPosY(hotspotDto.getPosY());
            hotspot.setWidth(hotspotDto.getWidth());
            hotspot.setHeight(hotspotDto.getHeight());
            hotspot.setInitiallyVisible(
                    hotspotDto.getInitiallyVisible() != null ? hotspotDto.getInitiallyVisible() : true
            );
            item.setHotspot(hotspot);
        } else {
            item.setHotspot(null);
        }
    }
}