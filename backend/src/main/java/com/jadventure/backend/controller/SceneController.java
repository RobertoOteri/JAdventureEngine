package com.jadventure.backend.controller;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.service.SceneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/scenes")
public class SceneController {

    private final SceneService sceneService;

    public SceneController(SceneService sceneService) {
        this.sceneService = sceneService;
    }

    @GetMapping
    public ResponseEntity<List<SceneDto>> getScenes(@RequestParam Long adventureId) {
        return ResponseEntity.ok(sceneService.getScenesByAdventure(adventureId));
    }

    @GetMapping("/{sceneId}")
    public ResponseEntity<SceneDto> getSceneById(@PathVariable Long sceneId) {
        return ResponseEntity.ok(sceneService.getSceneById(sceneId));
    }

    @DeleteMapping("/{sceneId}")
    public ResponseEntity<Void> deleteSceneById(@PathVariable Long sceneId) {
        sceneService.deleteSceneById(sceneId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{sceneId}/addItem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> addItem(
            @PathVariable Long sceneId,
            @Valid @RequestPart("data") ItemDto itemDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sceneService.addItem(sceneId, itemDto, image));
    }
}