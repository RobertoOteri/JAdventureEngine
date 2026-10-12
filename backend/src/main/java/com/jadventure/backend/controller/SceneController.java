package com.jadventure.backend.controller;

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

    @GetMapping("/adventure/{adventureCode}")
    public ResponseEntity<List<SceneDto>> getScenesByAdventure(@PathVariable("adventureCode") String adventureCode) {
        return ResponseEntity.ok(sceneService.getScenesByAdventure(adventureCode));
    }

    @PostMapping(value = "/adventure/{adventureCode}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SceneDto> createScene(
            @PathVariable("adventureCode") String adventureCode,
            @Valid @RequestPart("data") SceneDto dto,
            @RequestPart("backgroundImage") MultipartFile backgroundImage) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sceneService.createScene(adventureCode, dto, backgroundImage));
    }

    @GetMapping("/{adventureCode}/{sceneCode}")
    public ResponseEntity<SceneDto> getScene(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode) {
        return ResponseEntity.ok(sceneService.getSceneByCode(adventureCode, sceneCode));
    }

    @DeleteMapping("/{adventureCode}/{sceneCode}")
    public ResponseEntity<Void> deleteScene(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode) {
        sceneService.deleteScene(adventureCode, sceneCode);
        return ResponseEntity.noContent().build();
    }
}