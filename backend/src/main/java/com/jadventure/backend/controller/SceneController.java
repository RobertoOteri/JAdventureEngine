package com.jadventure.backend.controller;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.service.SceneService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/scenes")
@Log4j2
public class SceneController {

    private final SceneService sceneService;

    public SceneController(SceneService sceneService) {
        this.sceneService = sceneService;
    }

    @GetMapping
    public ResponseEntity<List<SceneDto>> getScenes(@RequestParam Long adventureId) {
        log.info("Received GET request for the list of scenes of adventure {}", adventureId);
        List<SceneDto> scenes = sceneService.getScenesByAdventure(adventureId);
        log.info("Returning {} scenes for adventure {}", scenes.size(), adventureId);
        return ResponseEntity.ok(scenes);
    }

    @GetMapping("/{sceneId}")
    public ResponseEntity<SceneDto> getSceneById(@PathVariable Long sceneId) {
        log.info("Received GET request for scene {}", sceneId);
        SceneDto scene = sceneService.getSceneById(sceneId);
        log.info("Returning scene {}", sceneId);
        return ResponseEntity.ok(scene);
    }

    @DeleteMapping("/{sceneId}")
    public ResponseEntity<Void> deleteSceneById(@PathVariable Long sceneId) {
        log.info("Received DELETE request for scene {}", sceneId);
        sceneService.deleteSceneById(sceneId);
        log.info("Scene {} deleted successfully", sceneId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{sceneId}/addItem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> addItem(
            @PathVariable Long sceneId,
            @Valid @RequestPart("data") ItemDto itemDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        log.info("Received POST request to add an item to scene {}", sceneId);
        ItemDto created = sceneService.addItem(sceneId, itemDto, image);
        log.info("Item added to scene {} with id {}", sceneId, created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
