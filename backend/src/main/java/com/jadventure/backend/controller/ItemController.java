package com.jadventure.backend.controller;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.service.ItemService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@Log4j2
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<List<ItemDto>> getAdventureItems(@RequestParam Long adventureId) {
        log.info("Received GET request for the list of items of adventure {}", adventureId);
        List<ItemDto> items = itemService.getAdventureItems(adventureId);
        log.info("Returning {} items for adventure {}", items.size(), adventureId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<ItemDto> getItemById(@PathVariable Long itemId) {
        log.info("Received GET request for item {}", itemId);
        ItemDto item = itemService.getItemById(itemId);
        log.info("Returning item {}", itemId);
        return ResponseEntity.ok(item);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> updateItem(
            @Valid @RequestPart("data") ItemDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        log.info("Received PUT request to update item {}", dto.getId());
        ItemDto updated = itemService.updateItem(dto, image);
        log.info("Item {} updated successfully", updated.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        log.info("Received DELETE request for item {}", itemId);
        itemService.deleteItemById(itemId);
        log.info("Item {} deleted successfully", itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/addAction")
    public ResponseEntity<ActionDto> addAction(
            @PathVariable Long itemId,
            @Valid @RequestBody ActionDto actionDto) {
        log.info("Received POST request to add action {} to item {}", actionDto, itemId);
        ActionDto created = itemService.addAction(itemId, actionDto);
        log.info("Action added to item {}: {}", itemId, created);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
