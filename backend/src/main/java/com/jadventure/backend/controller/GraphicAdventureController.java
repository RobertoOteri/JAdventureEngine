package com.jadventure.backend.controller;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.service.GraphicAdventureService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/adventures")
@Log4j2
public class GraphicAdventureController {

    private final GraphicAdventureService graphicAdventureService;

    public GraphicAdventureController(GraphicAdventureService graphicAdventureService) {
        this.graphicAdventureService = graphicAdventureService;
    }

    @GetMapping
    public ResponseEntity<List<GraphicAdventureDto>> getAllAdventures() {
        log.info("Received GET request for the list of all adventures");
        List<GraphicAdventureDto> adventures = graphicAdventureService.getAllAdventures();
        log.info("Returning {} adventures", adventures.size());
        return ResponseEntity.ok(adventures);
    }

    @GetMapping("/my")
    public ResponseEntity<List<GraphicAdventureDto>> getMyAdventures() {
        log.info("Received GET request for the adventures of the current user");
        List<GraphicAdventureDto> adventures = graphicAdventureService.getMyAdventures();
        log.info("Returning {} adventures of the current user", adventures.size());
        return ResponseEntity.ok(adventures);
    }

    @GetMapping("/{adventureId}")
    public ResponseEntity<GraphicAdventureDto> getAdventureById(@PathVariable Long adventureId) {
        log.info("Received GET request for adventure {}", adventureId);
        GraphicAdventureDto adventure = graphicAdventureService.getAdventureById(adventureId);
        log.info("Returning adventure {}", adventure);
        return ResponseEntity.ok(adventure);
    }

    @GetMapping("/{adventureId}/versions")
    public ResponseEntity<List<GraphicAdventureDto>> getPublishedVersions(@PathVariable Long adventureId) {
        log.info("Received GET request for the published versions of adventure {}", adventureId);
        List<GraphicAdventureDto> versions = graphicAdventureService.getPublishedVersions(adventureId);
        log.info("Returning {} published versions of adventure {}", versions.size(), adventureId);
        return ResponseEntity.ok(versions);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureDto> createAdventure(
            @Valid @RequestPart("data") GraphicAdventureDto data,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        log.info("Received POST request to create adventure {} (cover image provided: {})", data, coverImage != null);
        GraphicAdventureDto created = graphicAdventureService.createAdventure(data, coverImage);
        log.info("Adventure created successfully: {}", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{adventureId}/publish")
    public ResponseEntity<GraphicAdventureDto> publish(@PathVariable Long adventureId) {
        log.info("Received POST request to publish adventure {}", adventureId);
        GraphicAdventureDto published = graphicAdventureService.publish(adventureId);
        log.info("Adventure {} published, new draft: {}", adventureId, published);
        return ResponseEntity.ok(published);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureDto> updateAdventure(
            @Valid @RequestPart("data") GraphicAdventureDto data,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        log.info("Received PUT request to update adventure {}", data);
        GraphicAdventureDto updated = graphicAdventureService.updateAdventure(data, coverImage);
        log.info("Adventure updated successfully: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{adventureId}")
    public ResponseEntity<Void> deleteAdventure(@PathVariable Long adventureId) {
        log.info("Received DELETE request for adventure {}", adventureId);
        graphicAdventureService.deleteAdventureById(adventureId);
        log.info("Adventure {} deleted successfully", adventureId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{adventureId}/addScene", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SceneDto> addScene(
            @PathVariable Long adventureId,
            @Valid @RequestPart("data") SceneDto sceneDto,
            @RequestPart("backgroundImage") MultipartFile backgroundImage) {
        log.info("Received POST request to add a scene to adventure {}", adventureId);
        SceneDto created = graphicAdventureService.addScene(adventureId, sceneDto, backgroundImage);
        log.info("Scene added to adventure {} with id {}", adventureId, created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(value = "/{adventureId}/addItem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> addItem(
            @PathVariable Long adventureId,
            @Valid @RequestPart("data") ItemDto itemDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        log.info("Received POST request to add an item to adventure {}", adventureId);
        ItemDto created = graphicAdventureService.addItem(adventureId, itemDto, image);
        log.info("Item added to adventure {} with id {}", adventureId, created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
