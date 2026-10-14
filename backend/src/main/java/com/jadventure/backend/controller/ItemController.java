package com.jadventure.backend.controller;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<List<ItemDto>> getItems(@RequestParam Long sceneId) {
        return ResponseEntity.ok(itemService.getItemsBySceneId(sceneId));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<ItemDto> getItemById(@PathVariable Long itemId) {
        return ResponseEntity.ok(itemService.getItemById(itemId));
    }

    @PutMapping(value = "/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestPart("data") ItemDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        return ResponseEntity.ok(itemService.updateItemById(itemId, dto, image));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        itemService.deleteItemById(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{itemId}/actions")
    public ResponseEntity<ActionDto> addAction(
            @PathVariable Long itemId,
            @Valid @RequestBody ActionDto actionDto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.addAction(itemId, actionDto));
    }
}