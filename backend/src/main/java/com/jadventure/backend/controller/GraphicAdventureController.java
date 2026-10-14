package com.jadventure.backend.controller;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.service.GraphicAdventureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/adventures")
public class GraphicAdventureController {

    private final GraphicAdventureService graphicAdventureService;

    public GraphicAdventureController(GraphicAdventureService graphicAdventureService) {
        this.graphicAdventureService = graphicAdventureService;
    }

    @GetMapping
    public ResponseEntity<List<GraphicAdventureDto>> getAllAdventures() {
        return ResponseEntity.ok(graphicAdventureService.getAllAdventures());
    }

    @GetMapping("/my")
    public ResponseEntity<List<GraphicAdventureDto>> getMyAdventures() {
        return ResponseEntity.ok(graphicAdventureService.getMyAdventures());
    }

    @GetMapping("/{adventureId}")
    public ResponseEntity<GraphicAdventureDto> getAdventureById(@PathVariable Long adventureId) {
        return ResponseEntity.ok(graphicAdventureService.getAdventureById(adventureId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureDto> createAdventure(
            @Valid @RequestPart("data") GraphicAdventureDto data,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        GraphicAdventureDto created = graphicAdventureService.createAdventure(data, coverImage);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{adventureId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureDto> updateAdventure(
            @PathVariable Long adventureId,
            @Valid @RequestPart("data") GraphicAdventureDto data,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        GraphicAdventureDto updated = graphicAdventureService.updateAdventureById(adventureId, data, coverImage);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{adventureId}")
    public ResponseEntity<Void> deleteAdventure(@PathVariable Long adventureId) {
        graphicAdventureService.deleteAdventureById(adventureId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{adventureId}/scenes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SceneDto> addScene(
            @PathVariable Long adventureId,
            @Valid @RequestPart("data") SceneDto sceneDto,
            @RequestPart("backgroundImage") MultipartFile backgroundImage) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(graphicAdventureService.addScene(adventureId, sceneDto, backgroundImage));
    }
}