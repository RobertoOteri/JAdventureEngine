package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.ActionRepository;
import com.jadventure.backend.repository.ItemRepository;
import com.jadventure.backend.repository.SceneRepository;
import com.jadventure.backend.util.FileStorageUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final SceneRepository sceneRepository;
    private final ActionRepository actionRepository;
    private final ItemMapper itemMapper;
    private final ActionMapper actionMapper;
    private final InventoryItemService inventoryItemService;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    public ItemService(ItemRepository itemRepository,
                       SceneRepository sceneRepository,
                       ActionRepository actionRepository,
                       ItemMapper itemMapper,
                       ActionMapper actionMapper,
                       InventoryItemService inventoryItemService,
                       FileStorageUtil fileStorageUtil,
                       AuthService authService) {
        this.itemRepository = itemRepository;
        this.sceneRepository = sceneRepository;
        this.actionRepository = actionRepository;
        this.itemMapper = itemMapper;
        this.actionMapper = actionMapper;
        this.inventoryItemService = inventoryItemService;
        this.fileStorageUtil = fileStorageUtil;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getItemsBySceneId(Long sceneId) {
        return itemMapper.toDtoList(itemRepository.findAllBySceneId(sceneId));
    }

    @Transactional(readOnly = true)
    public ItemDto getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto non trovato con ID: " + itemId));
        return itemMapper.toDto(item);
    }

    @Transactional
    public ItemDto createItem(Long sceneId, ItemDto dto, MultipartFile sceneImage, MultipartFile inventoryImage) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));

        GraphicAdventure adventure = scene.getGraphicAdventure();
        authService.validateOwnership(adventure.getAuthor().getUsername());

        Item item = itemMapper.toEntity(dto);
        item.setScene(scene);

        if (sceneImage != null && !sceneImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE, adventure.getCode(), scene.getCode(), dto.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, sceneImage));
        }

        if (dto.getLinkedInventoryItem() != null) {
            InventoryItem invItem = inventoryItemService.upsertLinkedInventoryItem(
                    adventure,
                    null,
                    dto.getLinkedInventoryItem(),
                    inventoryImage
            );
            item.setLinkedInventoryItem(invItem);
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public ItemDto updateItem(ItemDto dto, MultipartFile sceneImage, MultipartFile inventoryImage) {
        Item item = itemRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto non trovato con ID: " + dto.getId()));

        GraphicAdventure adventure = item.getScene().getGraphicAdventure();
        authService.validateOwnership(adventure.getAuthor().getUsername());

        copyItemProperties(item, dto);

        if (sceneImage != null && !sceneImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE, adventure.getCode(), item.getScene().getCode(), item.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, sceneImage));
        }

        if (dto.getLinkedInventoryItem() == null) {
            item.setLinkedInventoryItem(null);
        } else {
            InventoryItem invItem = inventoryItemService.upsertLinkedInventoryItem(
                    adventure,
                    item.getLinkedInventoryItem(),
                    dto.getLinkedInventoryItem(),
                    inventoryImage
            );
            item.setLinkedInventoryItem(invItem);
        }

        return itemMapper.toDto(itemRepository.save(item));
    }

    @Transactional
    public void deleteItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto non trovato con ID: " + itemId));

        authService.validateOwnership(item.getScene().getGraphicAdventure().getAuthor().getUsername());
        itemRepository.delete(item);
    }

    @Transactional
    public ActionDto addAction(Long itemId, ActionDto actionDto) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trovato con ID: " + itemId));

        authService.validateOwnership(item.getScene().getGraphicAdventure().getAuthor().getUsername());

        validateActionUniqueness(item.getActions(), actionDto);

        Action action = actionMapper.toEntity(actionDto);
        action.setItem(item);

        return actionMapper.toDto(actionRepository.save(action));
    }

    private void validateActionUniqueness(List<Action> existingActions, ActionDto actionDto) {
        boolean typeAlreadyUsed = existingActions.stream()
                .anyMatch(existing -> existing.getType() == actionDto.getType());

        if (typeAlreadyUsed) {
            throw new IllegalArgumentException("L'oggetto ha già un'azione di tipo " + actionDto.getType());
        }
    }

    private void copyItemProperties(Item item, ItemDto dto) {
        item.setName(dto.getName());
        item.setPosX(dto.getPosX());
        item.setPosY(dto.getPosY());
        item.setPoints(dto.getPoints());
        item.setWidth(dto.getWidth());
        item.setHeight(dto.getHeight());
        item.setInitiallyVisible(dto.isInitiallyVisible());
    }
}