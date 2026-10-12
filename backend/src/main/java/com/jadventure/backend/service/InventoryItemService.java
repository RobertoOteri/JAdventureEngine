package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.InventoryItemMapper;
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
    private final GraphicAdventureService graphicAdventureService;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                InventoryItemMapper inventoryItemMapper,
                                GraphicAdventureService graphicAdventureService,
                                FileStorageService fileStorageService,
                                AuthService authService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
        this.graphicAdventureService = graphicAdventureService;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public InventoryItemDto getInventoryItem(String adventureCode, String itemCode) {
        graphicAdventureService.getAdventureByCode(adventureCode);

        InventoryItem item = inventoryItemRepository.findByGraphicAdventureCodeAndCode(adventureCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato: " + itemCode));
        return inventoryItemMapper.toDto(item);
    }

    @Transactional
    public InventoryItemDto createInventoryItem(String adventureCode, InventoryItemDto dto, MultipartFile image) {
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        authService.validateOwnership(adventureDto.getAuthorUsername());

        String itemCode = dto.getCode();
        if (itemCode == null || itemCode.isBlank()) {
            throw new IllegalArgumentException("Codice oggetto inventario obbligatorio");
        }

        if (inventoryItemRepository.existsByGraphicAdventureCodeAndCode(adventureCode, itemCode)) {
            throw new IllegalArgumentException("Oggetto inventario già esistente: " + itemCode);
        }

        String imageUrl = "";
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeInventoryItemIcon(adventureCode, itemCode, image);
        } else if (dto.getImageUrl() != null) {
            imageUrl = dto.getImageUrl();
        }
        dto.setImageUrl(imageUrl);

        InventoryItem entity = inventoryItemMapper.toEntity(dto, adventureDto);
        return inventoryItemMapper.toDto(inventoryItemRepository.save(entity));
    }

    @Transactional
    public InventoryItem createLinkedInventoryItem(GraphicAdventureDto adventureDto,
                                                   InventoryItemDto dto,
                                                   String fallbackName,
                                                   String iconUrl) {
        String itemCode = dto.getCode();
        if (itemCode == null || itemCode.isBlank()) {
            throw new IllegalArgumentException("Codice oggetto inventario obbligatorio");
        }

        if (inventoryItemRepository.existsByGraphicAdventureCodeAndCode(adventureDto.getCode(), itemCode)) {
            throw new IllegalArgumentException("Oggetto inventario già esistente: " + itemCode);
        }

        if (dto.getName() == null || dto.getName().isBlank()) {
            dto.setName(fallbackName);
        }
        dto.setImageUrl(iconUrl != null ? iconUrl : "");

        InventoryItem entity = inventoryItemMapper.toEntity(dto, adventureDto);
        return inventoryItemRepository.save(entity);
    }

    @Transactional
    public InventoryItem updateOrCreateLinkedItem(GraphicAdventureDto adventureDto,
                                                  InventoryItem existingItem,
                                                  InventoryItemDto dto,
                                                  String fallbackName,
                                                  String iconUrl) {
        if (existingItem == null) {
            return createLinkedInventoryItem(adventureDto, dto, fallbackName, iconUrl);
        }

        existingItem.setName(dto.getName() != null && !dto.getName().isBlank() ? dto.getName() : fallbackName);
        existingItem.setDescription(dto.getDescription());
        if (iconUrl != null && !iconUrl.isBlank()) {
            existingItem.setImageUrl(iconUrl);
        }

        return inventoryItemRepository.save(existingItem);
    }

    @Transactional
    public InventoryItemDto updateInventoryItem(String adventureCode, String itemCode, InventoryItemDto dto, MultipartFile image) {
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        authService.validateOwnership(adventureDto.getAuthorUsername());

        InventoryItem item = inventoryItemRepository.findByGraphicAdventureCodeAndCode(adventureCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato: " + itemCode));

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeInventoryItemIcon(adventureCode, itemCode, image);
            item.setImageUrl(imageUrl);
        } else if (dto.getImageUrl() != null) {
            item.setImageUrl(dto.getImageUrl());
        }

        InventoryItem saved = inventoryItemRepository.save(item);
        return inventoryItemMapper.toDto(saved);
    }

    @Transactional
    public void deleteInventoryItem(String adventureCode, String itemCode) {
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        authService.validateOwnership(adventureDto.getAuthorUsername());

        InventoryItem invItem = inventoryItemRepository.findByGraphicAdventureCodeAndCode(adventureCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato: " + itemCode));

        inventoryItemRepository.delete(invItem);
    }

    @Transactional(readOnly = true)
    public List<InventoryItemDto> getInventoryItemsByCodes(Set<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return Collections.emptyList();
        }

        return inventoryItemRepository.findAllByCodeIn(codes).stream()
                .map(inventoryItemMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean exists(String adventureCode, String itemCode) {
        return inventoryItemRepository.existsByGraphicAdventureCodeAndCode(adventureCode, itemCode);
    }

    @Transactional
    public InventoryItem save(InventoryItem inventoryItem) {
        return inventoryItemRepository.save(inventoryItem);
    }
}