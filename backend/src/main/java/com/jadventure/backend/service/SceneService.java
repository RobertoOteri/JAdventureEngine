package com.jadventure.backend.service;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.SceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final SceneMapper sceneMapper;
    private final ItemMapper itemMapper;
    private final AuthService authService;
    private final FileStorageService fileStorageService;
    private final InventoryItemService inventoryItemService;

    public SceneService(SceneRepository sceneRepository,
                        SceneMapper sceneMapper,
                        ItemMapper itemMapper,
                        AuthService authService,
                        FileStorageService fileStorageService,
                        InventoryItemService inventoryItemService) {
        this.sceneRepository = sceneRepository;
        this.sceneMapper = sceneMapper;
        this.itemMapper = itemMapper;
        this.authService = authService;
        this.fileStorageService = fileStorageService;
        this.inventoryItemService = inventoryItemService;
    }

    @Transactional(readOnly = true)
    public List<SceneDto> getScenesByAdventure(String adventureCode) {
        return sceneMapper.toDtoList(sceneRepository.findAllByGraphicAdventureCode(adventureCode));
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneById(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));
        return sceneMapper.toDto(scene);
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneByCode(String adventureCode, String sceneCode) {
        Scene scene = sceneRepository.findByGraphicAdventureCodeAndCode(adventureCode, sceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata: " + sceneCode));
        return sceneMapper.toDto(scene);
    }

    @Transactional
    public void deleteSceneById(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));

        authService.validateOwnership(scene.getGraphicAdventure().getAuthor().getUsername());

        sceneRepository.delete(scene);
    }

    @Transactional
    public ItemDto addItem(Long sceneId, ItemDto itemDto, MultipartFile image, MultipartFile inventoryImage) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));

        authService.validateOwnership(scene.getGraphicAdventure().getAuthor().getUsername());

        if (scene.getItems().stream().anyMatch(i -> i.getCode().equalsIgnoreCase(itemDto.getCode()))) {
            throw new IllegalArgumentException("Item già presente con codice: " + itemDto.getCode());
        }

        Item item = itemMapper.toEntity(itemDto);

        // 1. Sprite per la stanza
        String effectiveSceneImageUrl = null;
        if (image != null && !image.isEmpty()) {
            effectiveSceneImageUrl = fileStorageService.storeItemImage(scene, itemDto.getCode(), image);
            item.setImageUrl(effectiveSceneImageUrl);
        } else if (itemDto.getImageUrl() != null && !itemDto.getImageUrl().isBlank()) {
            effectiveSceneImageUrl = itemDto.getImageUrl();
            item.setImageUrl(effectiveSceneImageUrl);
        }

        // 2. Icona per l'inventario
        if (itemDto.getLinkedInventoryItem() != null) {
            String effectiveInventoryIconUrl = null;

            if (inventoryImage != null && !inventoryImage.isEmpty()) {
                effectiveInventoryIconUrl = fileStorageService.storeInventoryItemIcon(
                        scene.getGraphicAdventure().getCode(),
                        itemDto.getLinkedInventoryItem().getCode(),
                        inventoryImage
                );
            } else if (itemDto.getLinkedInventoryItem().getImageUrl() != null && !itemDto.getLinkedInventoryItem().getImageUrl().isBlank()) {
                effectiveInventoryIconUrl = itemDto.getLinkedInventoryItem().getImageUrl();
            } else {
                effectiveInventoryIconUrl = effectiveSceneImageUrl;
            }

            itemDto.getLinkedInventoryItem().setImageUrl(effectiveInventoryIconUrl);

            InventoryItem invItem = inventoryItemService.createInventoryItem(
                    scene.getGraphicAdventure(),
                    itemDto.getLinkedInventoryItem(),
                    effectiveInventoryIconUrl
            );

            if (effectiveInventoryIconUrl != null) {
                invItem.setImageUrl(effectiveInventoryIconUrl);
            }

            item.setLinkedInventoryItem(invItem);
        }

        item.setScene(scene);
        scene.getItems().add(item);

        Scene savedScene = sceneRepository.save(scene);

        Item persistedItem = savedScene.getItems().stream()
                .filter(i -> i.getCode().equalsIgnoreCase(itemDto.getCode()))
                .findFirst()
                .orElse(item);

        return itemMapper.toDto(persistedItem);
    }
}