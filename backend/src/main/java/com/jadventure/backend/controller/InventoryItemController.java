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
@RequestMapping("/api/adventures/{adventureCode}/inventory-items")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @GetMapping("/{itemCode}")
    public ResponseEntity<InventoryItemDto> getInventoryItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("itemCode") String itemCode) {
        return ResponseEntity.ok(inventoryItemService.getInventoryItem(adventureCode, itemCode));
    }

    @PutMapping(value = "/{itemCode}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InventoryItemDto> updateInventoryItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("itemCode") String itemCode,
            @Valid @RequestPart("data") InventoryItemDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(inventoryItemService.updateInventoryItem(adventureCode, itemCode, dto, image));
    }

    @DeleteMapping("/{itemCode}")
    public ResponseEntity<Void> deleteInventoryItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("itemCode") String itemCode) {
        inventoryItemService.deleteInventoryItem(adventureCode, itemCode);
        return ResponseEntity.noContent().build();
    }
}