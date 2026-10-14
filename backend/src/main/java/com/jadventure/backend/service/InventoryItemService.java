package com.jadventure.backend.service;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.InventoryItemMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                InventoryItemMapper inventoryItemMapper,
                                FileStorageService fileStorageService,
                                AuthService authService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> getAdventureInventoryItems(String adventureCode) {
        return inventoryItemRepository.findAllByGraphicAdventureCode(adventureCode).stream()
                .map(inventoryItemMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventoryItemDto getInventoryItemById(Long inventoryItemId) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato con ID: " + inventoryItemId));
        return inventoryItemMapper.toDto(item);
    }

    @Transactional
    public InventoryItemDto updateInventoryItemById(Long inventoryItemId, InventoryItemDto dto, MultipartFile image) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato con ID: " + inventoryItemId));

        authService.validateOwnership(item.getGraphicAdventure().getAuthor().getUsername());

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());

        if (image != null && !image.isEmpty()) {
            String advCode = item.getGraphicAdventure().getCode();
            String imageUrl = fileStorageService.storeInventoryItemIcon(advCode, item.getCode(), image);
            item.setImageUrl(imageUrl);
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
    public InventoryItem updateOrCreateLinkedItem(GraphicAdventure adventure,
                                                  InventoryItem existingItem,
                                                  InventoryItemDto dto,
                                                  String fallbackName,
                                                  String fallbackIconUrl) {
        if (existingItem == null) {
            return createInventoryItem(adventure, dto, fallbackIconUrl);
        }

        existingItem.setName(dto.getName() != null && !dto.getName().isBlank() ? dto.getName() : fallbackName);
        existingItem.setDescription(dto.getDescription());

        if (dto.getImageUrl() != null && !dto.getImageUrl().isBlank()) {
            existingItem.setImageUrl(dto.getImageUrl());
        } else if ((existingItem.getImageUrl() == null || existingItem.getImageUrl().isBlank())
                && fallbackIconUrl != null && !fallbackIconUrl.isBlank()) {
            existingItem.setImageUrl(fallbackIconUrl);
        }

        return inventoryItemRepository.save(existingItem);
    }

    @Transactional
    public InventoryItem createInventoryItem(GraphicAdventure adventure,
                                             InventoryItemDto dto,
                                             String fallbackImageUrl) {
        if (dto == null || dto.getCode() == null || dto.getCode().isBlank()) {
            return null;
        }

        return inventoryItemRepository
                .findByGraphicAdventureCodeAndCode(adventure.getCode(), dto.getCode())
                .orElseGet(() -> {
                    InventoryItem entity = inventoryItemMapper.toEntity(dto);
                    entity.setGraphicAdventure(adventure);

                    String img = entity.getImageUrl();
                    if (img == null || img.isBlank()) {
                        img = (fallbackImageUrl != null && !fallbackImageUrl.isBlank()) ? fallbackImageUrl : "";
                    }
                    entity.setImageUrl(img);

                    if (entity.getName() == null || entity.getName().isBlank()) {
                        entity.setName(dto.getName() != null ? dto.getName() : dto.getCode());
                    }

                    return inventoryItemRepository.save(entity);
                });
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> getInventoryItemsByAdventureAndCodes(String adventureCode, Set<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return Collections.emptyList();
        }

        return inventoryItemRepository.findAllByGraphicAdventureCodeAndCodeIn(adventureCode, codes).stream()
                .map(inventoryItemMapper::toDto)
                .collect(Collectors.toList());
    }
}