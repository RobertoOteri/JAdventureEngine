package com.jadventure.backend.service;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.InventoryItemMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.InventoryItem;
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
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                InventoryItemMapper inventoryItemMapper,
                                FileStorageUtil fileStorageUtil,
                                AuthService authService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
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
    public InventoryItem resolveInventoryItem(GraphicAdventure adventure,
                                              InventoryItem existingLinkedItem,
                                              InventoryItemDto dto,
                                              MultipartFile dedicatedImage,
                                              String fallbackImageUrl) {
        if (dto == null) {
            return null;
        }

        InventoryItem item = existingLinkedItem;
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

        if (dedicatedImage != null && !dedicatedImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_INVENTORY_ITEM, adventure.getCode(), item.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, dedicatedImage));
        } else if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            item.setImageUrl(dto.getImageUrl());
        } else if (fallbackImageUrl != null && !fallbackImageUrl.isBlank()) {
            item.setImageUrl(fallbackImageUrl);
        } else if (item.getImageUrl() == null) {
            item.setImageUrl("");
        }

        return inventoryItemRepository.save(item);
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