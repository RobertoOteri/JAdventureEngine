package com.jadventure.backend.controller;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.service.InventoryItemService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/inventory-items")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemDto>> getAdventureInventoryItems(
            @RequestParam("adventureCode") String adventureCode) {
        return ResponseEntity.ok(inventoryItemService.getAdventureInventoryItems(adventureCode));
    }

    @GetMapping("/{inventoryItemId}")
    public ResponseEntity<InventoryItemDto> getInventoryItemById(
            @PathVariable Long inventoryItemId) {
        return ResponseEntity.ok(inventoryItemService.getInventoryItemById(inventoryItemId));
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InventoryItemDto> updateInventoryItemById(
            @Valid @RequestPart("data") InventoryItemDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(inventoryItemService.updateInventoryItem(dto, image));
    }

    @DeleteMapping("/{inventoryItemId}")
    public ResponseEntity<Void> deleteInventoryItemById(
            @PathVariable Long inventoryItemId) {
        inventoryItemService.deleteInventoryItemById(inventoryItemId);
        return ResponseEntity.noContent().build();
    }
}