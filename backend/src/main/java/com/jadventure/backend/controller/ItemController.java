package com.jadventure.backend.controller;

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

    @GetMapping("/scene/{adventureCode}/{sceneCode}")
    public ResponseEntity<List<ItemDto>> getItems(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode) {
        return ResponseEntity.ok(itemService.getItemsByScene(adventureCode, sceneCode));
    }

    @GetMapping("/{adventureCode}/{sceneCode}/{itemCode}")
    public ResponseEntity<ItemDto> getItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode) {
        return ResponseEntity.ok(itemService.getItemByCode(adventureCode, sceneCode, itemCode));
    }

    @PostMapping(value = "/scene/{adventureCode}/{sceneCode}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> createItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @Valid @RequestPart("data") ItemDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.createItem(adventureCode, sceneCode, dto, image));
    }

    @PutMapping(value = "/{adventureCode}/{sceneCode}/{itemCode}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> updateItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode,
            @Valid @RequestPart("data") ItemDto dto,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        return ResponseEntity.ok(itemService.updateItem(adventureCode, sceneCode, itemCode, dto, image));
    }

    @DeleteMapping("/{adventureCode}/{sceneCode}/{itemCode}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode) {

        itemService.deleteItem(adventureCode, sceneCode, itemCode);
        return ResponseEntity.noContent().build();
    }
}