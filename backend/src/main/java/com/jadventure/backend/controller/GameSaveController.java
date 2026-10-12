package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.service.GameSaveService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saves")
public class GameSaveController {

    private final GameSaveService gameSaveService;

    public GameSaveController(GameSaveService gameSaveService) {
        this.gameSaveService = gameSaveService;
    }

    @GetMapping("/adventure/{adventureCode}")
    public ResponseEntity<List<GameSaveDto>> getSavesForAdventure(@PathVariable("adventureCode") String adventureCode) {
        return ResponseEntity.ok(gameSaveService.getSavesForAdventure(adventureCode));
    }

    @GetMapping("/{saveCode}")
    public ResponseEntity<GameSaveDto> getSave(@PathVariable("saveCode") String saveCode) {
        return ResponseEntity.ok(gameSaveService.getSaveByCode(saveCode));
    }

    @PostMapping("/{activeSaveCode}")
    public ResponseEntity<GameSaveDto> createSave(
            @PathVariable("activeSaveCode") String activeSaveCode,
            @RequestParam(required = false) String saveName) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gameSaveService.createSaveFromActive(activeSaveCode, saveName));
    }
}