package com.jadventure.backend.service;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.InventoryItemMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.InventoryItem;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.InventoryItemRepository;
import com.jadventure.backend.repository.ItemRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final ItemRepository itemRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final FileStorageService fileStorageService;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                GraphicAdventureRepository graphicAdventureRepository,
                                ItemRepository itemRepository,
                                InventoryItemMapper inventoryItemMapper,
                                FileStorageService fileStorageService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.itemRepository = itemRepository;
        this.inventoryItemMapper = inventoryItemMapper;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public InventoryItemDto getInventoryItem(String adventureCode, String itemCode) {
        if (!graphicAdventureRepository.existsByCode(adventureCode)) {
            throw new ResourceNotFoundException("Avventura non trovata: " + adventureCode);
        }
        InventoryItem item = inventoryItemRepository.findByGraphicAdventureCodeAndCode(adventureCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato: " + itemCode));
        return inventoryItemMapper.toDto(item);
    }

    @Transactional
    public InventoryItemDto updateInventoryItem(String adventureCode, String itemCode, InventoryItemDto dto, MultipartFile image) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata: " + adventureCode));
        validateOwnership(adventure);

        InventoryItem item = inventoryItemRepository.findByGraphicAdventureCodeAndCode(adventureCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato: " + itemCode));

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileStorageService.storeInventoryItemIcon(adventureCode, itemCode, image);
            item.setImageUrl(imageUrl);
        }

        InventoryItem saved = inventoryItemRepository.save(item);
        return inventoryItemMapper.toDto(saved);
    }

    @Transactional
    public void deleteInventoryItem(String adventureCode, String itemCode) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata: " + adventureCode));
        validateOwnership(adventure);

        InventoryItem invItem = inventoryItemRepository.findByGraphicAdventureCodeAndCode(adventureCode, itemCode)
                .orElseThrow(() -> new ResourceNotFoundException("Oggetto inventario non trovato: " + itemCode));

        itemRepository.findByLinkedInventoryItemId(invItem.getId()).ifPresent(item -> {
            item.setLinkedInventoryItem(null);
            itemRepository.save(item);
            itemRepository.flush();
        });

        inventoryItemRepository.delete(invItem);
    }

    private void validateOwnership(GraphicAdventure adventure) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && !adventure.getAuthor().getUsername().equals(auth.getName())) {
            throw new AccessDeniedException("Accesso negato");
        }
    }
}