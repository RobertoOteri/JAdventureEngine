package com.jadventure.backend.service;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.InventoryItemRepository;
import com.jadventure.backend.repository.ItemRepository;
import com.jadventure.backend.repository.SceneRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final SceneRepository sceneRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final FileStorageService fileStorageService;
    private final ItemMapper itemMapper;

    public ItemService(ItemRepository itemRepository,
                       SceneRepository sceneRepository,
                       InventoryItemRepository inventoryItemRepository,
                       FileStorageService fileStorageService,
                       ItemMapper itemMapper) {
        this.itemRepository = itemRepository;
        this.sceneRepository = sceneRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.fileStorageService = fileStorageService;
        this.itemMapper = itemMapper;
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getItemsByScene(String adventureCode, String sceneCode) {
        Scene scene = findScene(adventureCode, sceneCode);
        return itemMapper.toDtoList(itemRepository.findAllBySceneCode(scene.getCode()));
    }

    @Transactional(readOnly = true)
    public ItemDto getItemByCode(String adventureCode, String sceneCode, String itemCode) {
        findScene(adventureCode, sceneCode);
        Item item = itemRepository.findBySceneCodeAndCode(sceneCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trovato: " + itemCode));
        return itemMapper.toDto(item);
    }

    @Transactional
    public ItemDto createItem(String adventureCode, String sceneCode, ItemDto dto, MultipartFile image) {
        Scene scene = findScene(adventureCode, sceneCode);
        validateOwnership(scene);

        String itemCode = dto.getCode();
        if (itemCode == null || itemCode.isBlank()) {
            throw new IllegalArgumentException("Codice item obbligatorio");
        }

        if (itemRepository.existsBySceneCodeAndCode(sceneCode, itemCode)) {
            throw new IllegalArgumentException("Item già esistente: " + itemCode);
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeItemImage(adventureCode, sceneCode, itemCode, image);
        }

        InventoryItem linkedInventoryItem = null;
        if (dto.getLinkedInventoryItem() != null) {
            InventoryItemDto invDto = dto.getLinkedInventoryItem();

            if (inventoryItemRepository.existsByGraphicAdventureCodeAndCode(adventureCode, itemCode)) {
                throw new IllegalArgumentException("Oggetto inventario già esistente: " + itemCode);
            }

            String iconUrl = imageUrl;
            if (image != null && !image.isEmpty()) {
                iconUrl = fileStorageService.storeInventoryItemIcon(adventureCode, itemCode, image);
            }

            linkedInventoryItem = InventoryItem.builder()
                    .code(itemCode)
                    .name(invDto.getName() != null && !invDto.getName().isBlank() ? invDto.getName() : dto.getName())
                    .description(invDto.getDescription())
                    .imageUrl(iconUrl != null ? iconUrl : "")
                    .graphicAdventure(scene.getGraphicAdventure())
                    .build();

            linkedInventoryItem = inventoryItemRepository.save(linkedInventoryItem);
        }

        Item item = Item.builder()
                .code(itemCode)
                .name(dto.getName())
                .imageUrl(imageUrl)
                .posX(dto.getPosX())
                .posY(dto.getPosY())
                .points(dto.getPoints())
                .width(dto.getWidth())
                .height(dto.getHeight())
                .initiallyVisible(dto.isInitiallyVisible())
                .linkedInventoryItem(linkedInventoryItem)
                .scene(scene)
                .actions(new ArrayList<>())
                .build();

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public ItemDto updateItem(String adventureCode, String sceneCode, String itemCode, ItemDto dto, MultipartFile image) {
        Scene scene = findScene(adventureCode, sceneCode);
        validateOwnership(scene);

        Item item = itemRepository.findBySceneCodeAndCode(sceneCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trovato: " + itemCode));

        item.setName(dto.getName());
        item.setPosX(dto.getPosX());
        item.setPosY(dto.getPosY());
        item.setPoints(dto.getPoints());
        item.setWidth(dto.getWidth());
        item.setHeight(dto.getHeight());
        item.setInitiallyVisible(dto.isInitiallyVisible());

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeItemImage(adventureCode, sceneCode, item.getCode(), image);
            item.setImageUrl(imageUrl);
        }

        if (dto.getLinkedInventoryItem() != null) {
            InventoryItemDto invDto = dto.getLinkedInventoryItem();
            InventoryItem invItem = item.getLinkedInventoryItem();

            if (invItem == null) {
                String iconUrl = item.getImageUrl();
                invItem = InventoryItem.builder()
                        .code(itemCode)
                        .name(invDto.getName() != null && !invDto.getName().isBlank() ? invDto.getName() : dto.getName())
                        .description(invDto.getDescription())
                        .imageUrl(iconUrl != null ? iconUrl : "")
                        .graphicAdventure(scene.getGraphicAdventure())
                        .build();
            } else {
                invItem.setName(invDto.getName() != null && !invDto.getName().isBlank() ? invDto.getName() : dto.getName());
                invItem.setDescription(invDto.getDescription());
            }

            invItem = inventoryItemRepository.save(invItem);
            item.setLinkedInventoryItem(invItem);
        } else {
            item.setLinkedInventoryItem(null);
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(String adventureCode, String sceneCode, String itemCode) {
        Scene scene = findScene(adventureCode, sceneCode);
        validateOwnership(scene);

        Item item = itemRepository.findBySceneCodeAndCode(sceneCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trovato: " + itemCode));

        itemRepository.delete(item);
    }

    private Scene findScene(String adventureCode, String sceneCode) {
        return sceneRepository.findByGraphicAdventureCodeAndCode(adventureCode, sceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata: " + sceneCode));
    }

    private void validateOwnership(Scene scene) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && !scene.getGraphicAdventure().getAuthor().getUsername().equals(auth.getName())) {
            throw new AccessDeniedException("Accesso negato");
        }
    }
}