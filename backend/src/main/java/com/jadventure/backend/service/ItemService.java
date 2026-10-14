package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ActionMapper;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;
    private final ActionMapper actionMapper;
    private final InventoryItemService inventoryItemService;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public ItemService(ItemRepository itemRepository,
                       ItemMapper itemMapper,
                       ActionMapper actionMapper,
                       InventoryItemService inventoryItemService,
                       FileStorageService fileStorageService,
                       AuthService authService) {
        this.itemRepository = itemRepository;
        this.itemMapper = itemMapper;
        this.actionMapper = actionMapper;
        this.inventoryItemService = inventoryItemService;
        this.fileStorageService = fileStorageService;
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
    public ItemDto updateItemById(Long itemId, ItemDto dto, MultipartFile image) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto non trovato con ID: " + itemId));

        authService.validateOwnership(item.getScene().getGraphicAdventure().getAuthor().getUsername());

        applyChanges(item, dto);

        if (image != null && !image.isEmpty()) {
            item.setImageUrl(fileStorageService.storeItemImage(item.getScene(), item.getCode(), image));
        }

        if (dto.getLinkedInventoryItem() != null) {
            InventoryItemDto invDto = dto.getLinkedInventoryItem();
            if (invDto.getCode() != null && !invDto.getCode().isBlank()) {
                InventoryItem invItem = inventoryItemService.updateOrCreateLinkedItem(
                        item.getScene().getGraphicAdventure(),
                        item.getLinkedInventoryItem(),
                        invDto,
                        dto.getName(),
                        item.getImageUrl()
                );
                item.setLinkedInventoryItem(invItem);
            }
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

        if (item.getActions() != null && item.getActions().stream().anyMatch(a -> a.getType() == actionDto.getType())) {
            throw new IllegalArgumentException("Azione già presente con tipo: " + actionDto.getType());
        }

        Action action = actionMapper.toEntity(actionDto);
        action.setItem(item);
        item.getActions().add(action);

        itemRepository.save(item);

        return actionMapper.toDto(action);
    }

    private void applyChanges(Item item, ItemDto dto) {
        item.setName(dto.getName());
        item.setPosX(dto.getPosX());
        item.setPosY(dto.getPosY());
        item.setPoints(dto.getPoints());
        item.setWidth(dto.getWidth());
        item.setHeight(dto.getHeight());
        item.setInitiallyVisible(dto.isInitiallyVisible());
    }
}