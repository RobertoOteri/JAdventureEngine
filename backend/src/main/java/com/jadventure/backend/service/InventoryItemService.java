package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.InventoryItemMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.repository.ActionRepository;
import com.jadventure.backend.repository.InventoryItemRepository;
import com.jadventure.backend.util.FileStorageUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final ActionMapper actionMapper;
    private final ActionRepository actionRepository;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                InventoryItemMapper inventoryItemMapper,
                                ActionMapper actionMapper,
                                ActionRepository actionRepository,
                                FileStorageUtil fileStorageUtil,
                                AuthService authService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
        this.actionMapper = actionMapper;
        this.actionRepository = actionRepository;
        this.fileStorageUtil = fileStorageUtil;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> getAdventureInventoryItems(String adventureCode) {
        return inventoryItemRepository.findAllByGraphicAdventureCode(adventureCode).stream()
                .map(inventoryItemMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryItemDto getInventoryItemById(Long inventoryItemId) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato con ID: " + inventoryItemId));
        return inventoryItemMapper.toDto(item);
    }

    @Transactional
    public InventoryItemDto updateInventoryItem(InventoryItemDto dto, MultipartFile image) {
        InventoryItem item = inventoryItemRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato con ID: " + dto.getId()));

        authService.validateOwnership(item.getGraphicAdventure().getAuthor().getUsername());

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_INVENTORY_ITEM, item.getGraphicAdventure().getCode(), item.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        } else if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            item.setImageUrl(dto.getImageUrl());
        }

        return inventoryItemMapper.toDto(inventoryItemRepository.save(item));
    }

    @Transactional
    public void deleteInventoryItemById(Long inventoryItemId) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato con ID: " + inventoryItemId));

        authService.validateOwnership(item.getGraphicAdventure().getAuthor().getUsername());
        inventoryItemRepository.delete(item);
    }

    @Transactional
    public InventoryItemDto createInventoryItem(GraphicAdventure adventure, InventoryItemDto dto, MultipartFile image) {
        InventoryItem item = saveOrUpdateEntity(adventure, null, dto, image);
        return inventoryItemMapper.toDto(item);
    }

    @Transactional
    public InventoryItem upsertLinkedInventoryItem(GraphicAdventure adventure,
                                                   InventoryItem existingLinkedItem,
                                                   InventoryItemDto dto,
                                                   MultipartFile image) {
        if (dto == null) {
            return null;
        }
        return saveOrUpdateEntity(adventure, existingLinkedItem, dto, image);
    }

    private InventoryItem saveOrUpdateEntity(GraphicAdventure adventure,
                                             InventoryItem existingItem,
                                             InventoryItemDto dto,
                                             MultipartFile image) {
        InventoryItem item = existingItem;

        if (item == null) {
            item = inventoryItemRepository
                    .findByGraphicAdventureCodeAndCode(adventure.getCode(), dto.getCode())
                    .orElseGet(() -> {
                        InventoryItem newItem = new InventoryItem();
                        newItem.setCode(dto.getCode());
                        newItem.setGraphicAdventure(adventure);
                        return newItem;
                    });
        }

        item.setName(dto.getName() != null && !dto.getName().isBlank() ? dto.getName() : dto.getCode());
        item.setDescription(dto.getDescription());

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_INVENTORY_ITEM, adventure.getCode(), item.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        } else if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            item.setImageUrl(dto.getImageUrl());
        } else if (item.getImageUrl() == null) {
            item.setImageUrl("");
        }

        return inventoryItemRepository.save(item);
    }

    @Transactional
    public ActionDto addAction(Long inventoryItemId, ActionDto actionDto) {
        InventoryItem invItem = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato con ID: " + inventoryItemId));

        authService.validateOwnership(invItem.getGraphicAdventure().getAuthor().getUsername());

        validateActionUniqueness(invItem.getActions(), actionDto);

        Action action = actionMapper.toEntity(actionDto);
        action.setInventoryItem(invItem);

        return actionMapper.toDto(actionRepository.save(action));
    }

    private void validateActionUniqueness(List<Action> existingActions, ActionDto actionDto) {
        if (actionDto.getType() == com.jadventure.backend.model.enums.ActionType.USE_WITH) {
            if (actionDto.getWithInventoryItemCode() == null || actionDto.getWithInventoryItemCode().isBlank()) {
                throw new IllegalArgumentException("Per l'azione USE_WITH è obbligatorio specificare withInventoryItemCode");
            }
            boolean duplicateUseWith = existingActions.stream()
                    .anyMatch(a -> a.getType() == com.jadventure.backend.model.enums.ActionType.USE_WITH
                            && actionDto.getWithInventoryItemCode().equalsIgnoreCase(a.getWithInventoryItemCode()));
            if (duplicateUseWith) {
                throw new IllegalArgumentException("Esiste già un'azione USE_WITH per l'oggetto: " + actionDto.getWithInventoryItemCode());
            }
        } else {
            boolean typeAlreadyUsed = existingActions.stream()
                    .anyMatch(existing -> existing.getType() == actionDto.getType());
            if (typeAlreadyUsed) {
                throw new IllegalArgumentException("L'oggetto inventario ha già un'azione di tipo " + actionDto.getType());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> loadPlayerInventory(String adventureCode, Set<String> itemCodes) {
        if (itemCodes == null || itemCodes.isEmpty()) {
            return Collections.emptyList();
        }

        return inventoryItemRepository.findAllByGraphicAdventureCodeAndCodeIn(adventureCode, itemCodes).stream()
                .map(inventoryItemMapper::toDto)
                .toList();
    }
}