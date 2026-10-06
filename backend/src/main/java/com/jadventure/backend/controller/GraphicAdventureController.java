package com.jadventure.backend.controller;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
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

    @GetMapping("/{code}")
    public ResponseEntity<GraphicAdventureDto> getAdventureByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(graphicAdventureService.getAdventureByCode(code));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureDto> createAdventure(
            @Valid @RequestPart("data") GraphicAdventureDto data,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        GraphicAdventureDto created = graphicAdventureService.createAdventure(data, coverImage);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteAdventure(@PathVariable("code") String code) {
        graphicAdventureService.deleteAdventure(code);
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/{code}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureDto> updateAdventure(
            @PathVariable("code") String code,
            @Valid @RequestPart("data") GraphicAdventureDto data,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        GraphicAdventureDto updated = graphicAdventureService.updateAdventure(code, data, coverImage);
        return ResponseEntity.ok(updated);
    }
}