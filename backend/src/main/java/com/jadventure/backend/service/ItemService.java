package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    private final SceneService sceneService;
    private final GraphicAdventureService graphicAdventureService;
    private final InventoryItemService inventoryItemService;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public ItemService(ItemRepository itemRepository,
                       ItemMapper itemMapper,
                       SceneService sceneService,
                       GraphicAdventureService graphicAdventureService,
                       InventoryItemService inventoryItemService,
                       FileStorageService fileStorageService,
                       AuthService authService) {
        this.itemRepository = itemRepository;
        this.itemMapper = itemMapper;
        this.sceneService = sceneService;
        this.graphicAdventureService = graphicAdventureService;
        this.inventoryItemService = inventoryItemService;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getItemsByScene(String adventureCode, String sceneCode) {
        sceneService.getSceneByCode(adventureCode, sceneCode);
        return itemMapper.toDtoList(itemRepository.findAllBySceneCode(sceneCode));
    }

    @Transactional(readOnly = true)
    public ItemDto getItemByCode(String adventureCode, String sceneCode, String itemCode) {
        return itemMapper.toDto(findItem(adventureCode, sceneCode, itemCode));
    }

    @Transactional
    public ItemDto createItem(String adventureCode, String sceneCode, ItemDto dto, MultipartFile image) {
        String itemCode = dto.getCode();
        if (itemCode == null || itemCode.isBlank()) {
            throw new IllegalArgumentException("Codice item obbligatorio");
        }

        if (itemRepository.existsBySceneCodeAndCode(sceneCode, itemCode)) {
            throw new IllegalArgumentException("Item già esistente: " + itemCode);
        }

        SceneDto sceneDto = sceneService.getSceneByCode(adventureCode, sceneCode);
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        authService.validateOwnership(adventureDto.getAuthorUsername());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeItemImage(adventureCode, sceneCode, itemCode, image);
        }

        InventoryItem linkedInventoryItem = null;
        if (dto.getLinkedInventoryItem() != null
                && dto.getLinkedInventoryItem().getCode() != null
                && !dto.getLinkedInventoryItem().getCode().isBlank()) {

            String iconUrl = (image != null && !image.isEmpty())
                    ? fileStorageService.storeInventoryItemIcon(adventureCode, dto.getLinkedInventoryItem().getCode(), image)
                    : imageUrl;

            linkedInventoryItem = inventoryItemService.createLinkedInventoryItem(
                    adventureDto,
                    dto.getLinkedInventoryItem(),
                    dto.getName(),
                    iconUrl
            );
        }

        Item item = itemMapper.toEntity(dto, sceneDto);
        item.setImageUrl(imageUrl);
        item.setLinkedInventoryItem(linkedInventoryItem);
        if (item.getActions() == null) {
            item.setActions(new ArrayList<>());
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public ItemDto updateItem(String adventureCode, String sceneCode, String itemCode, ItemDto dto, MultipartFile image) {
        Item item = findItem(adventureCode, sceneCode, itemCode);
        authService.validateOwnership(item.getScene().getGraphicAdventure().getAuthor().getUsername());

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
            if (invDto.getCode() != null && !invDto.getCode().isBlank()) {
                GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
                String iconUrl = item.getImageUrl();

                InventoryItem invItem = inventoryItemService.updateOrCreateLinkedItem(
                        adventureDto,
                        item.getLinkedInventoryItem(),
                        invDto,
                        dto.getName(),
                        iconUrl
                );
                item.setLinkedInventoryItem(invItem);
            }
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public void deleteItem(String adventureCode, String sceneCode, String itemCode) {
        Item item = findItem(adventureCode, sceneCode, itemCode);
        authService.validateOwnership(item.getScene().getGraphicAdventure().getAuthor().getUsername());

        itemRepository.delete(item);
    }

    private Item findItem(String adventureCode, String sceneCode, String itemCode) {
        return itemRepository.findBySceneGraphicAdventureCodeAndSceneCodeAndCode(adventureCode, sceneCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Item non trovato: " + itemCode + " per la scena: " + sceneCode
                ));
    }
}