package com.jadventure.backend.controller;

import com.jadventure.backend.dto.adventure.GraphicAdventureCreateRequest;
import com.jadventure.backend.dto.adventure.GraphicAdventureResponse;
import com.jadventure.backend.service.GraphicAdventureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/adventures")
public class GraphicAdventureController {

    private final GraphicAdventureService graphicAdventureService;

    public GraphicAdventureController(GraphicAdventureService graphicAdventureService) {
        this.graphicAdventureService = graphicAdventureService;
    }

    @GetMapping
    public ResponseEntity<List<GraphicAdventureResponse>> getAllAdventures() {
        return ResponseEntity.ok(graphicAdventureService.getAllAdventures());
    }

    @GetMapping("/my")
    public ResponseEntity<List<GraphicAdventureResponse>> getMyAdventures(Principal principal) {
        return ResponseEntity.ok(graphicAdventureService.getAdventuresByAuthor(principal.getName()));
    }

    @GetMapping("/{code}")
    public ResponseEntity<GraphicAdventureResponse> getAdventureByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(graphicAdventureService.getAdventureByCode(code));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GraphicAdventureResponse> createAdventure(
            @Valid @RequestPart("data") GraphicAdventureCreateRequest request,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(graphicAdventureService.createAdventure(request, coverImage));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteAdventure(@PathVariable String code, Principal principal) {
        graphicAdventureService.deleteAdventure(code, principal.getName());
        return ResponseEntity.noContent().build();
    }

}
