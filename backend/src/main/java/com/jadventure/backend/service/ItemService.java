package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.item.HotspotDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Hotspot;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.enums.ActionType;
import com.jadventure.backend.repository.ItemRepository;
import com.jadventure.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;
    private final ActionMapper actionMapper;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<ItemDto> getAdventureItems(Long adventureId) {
        return itemMapper.toDtoList(itemRepository.findAllByGraphicAdventureId(adventureId));
    }

    @Transactional(readOnly = true)
    public ItemDto getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("error.item.notFoundById", itemId));
        return itemMapper.toDto(item);
    }

    @Transactional
    public ItemDto updateItem(ItemDto dto, MultipartFile image) {
        Item item = itemRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("error.item.notFoundById", dto.getId()));

        GraphicAdventure adventure = item.getGraphicAdventure();
        authService.validateEditable(adventure.getAuthor().getUsername(), adventure.getStatus());

        copyItemProperties(item, dto);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE,
                    adventure.getCode(), adventure.getVersionNumber(), item.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        } else if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            item.setImageUrl(dto.getImageUrl());
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public void deleteItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("error.item.notFoundById", itemId));

        authService.validateEditable(
                item.getGraphicAdventure().getAuthor().getUsername(),
                item.getGraphicAdventure().getStatus());
        itemRepository.delete(item);
    }

    @Transactional
    public ActionDto addAction(Long itemId, ActionDto actionDto) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("error.item.notFoundById", itemId));

        authService.validateEditable(
                item.getGraphicAdventure().getAuthor().getUsername(),
                item.getGraphicAdventure().getStatus());

        validateActionUniqueness(item.getActions(), actionDto);

        Action action = actionMapper.toEntity(actionDto);
        action.setItem(item);
        item.getActions().add(action);

        itemRepository.saveAndFlush(item);

        return actionMapper.toDto(action);
    }

    @Transactional(readOnly = true)
    public List<ItemDto> loadPlayerInventory(Long adventureId, Collection<String> itemCodes) {
        if (itemCodes == null || itemCodes.isEmpty()) {
            return Collections.emptyList();
        }
        return itemMapper.toDtoList(
                itemRepository.findAllByGraphicAdventureIdAndCodeIn(adventureId, itemCodes)
        );
    }

    public void validateActionUniqueness(List<Action> existingActions, ActionDto actionDto) {
        if (actionDto.getType() == ActionType.USE_WITH) {
            if (actionDto.getTargetItemCode() == null || actionDto.getTargetItemCode().isBlank()) {
                throw new InvalidOperationException("error.action.useWithTargetRequired");
            }
            boolean duplicateUseWith = existingActions.stream()
                    .anyMatch(a -> a.getType() == ActionType.USE_WITH
                            && actionDto.getTargetItemCode().equalsIgnoreCase(a.getTargetItemCode()));
            if (duplicateUseWith) {
                throw new InvalidOperationException("error.action.duplicateUseWith", actionDto.getTargetItemCode());
            }
        } else {
            boolean typeAlreadyUsed = existingActions.stream()
                    .anyMatch(existing -> existing.getType() == actionDto.getType());
            if (typeAlreadyUsed) {
                throw new InvalidOperationException("error.action.duplicateType", actionDto.getType());
            }
        }
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