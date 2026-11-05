package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
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

    @GetMapping("/saveGame/{adventureId}")
    public ResponseEntity<List<GameSaveDto>> getSavesForAdventure(@PathVariable("adventureId") Long adventureId) {
        return ResponseEntity.ok(gameSaveService.getSavesForAdventure(adventureId));
    }

    @GetMapping("/{saveCode}")
    public ResponseEntity<GameSaveDto> getSave(@PathVariable("saveCode") String saveCode) {
        return ResponseEntity.ok(gameSaveService.getSaveByCode(saveCode));
    }


    @PostMapping("/{adventureId}")
    public ResponseEntity<GameSaveDto> createSave(@PathVariable("adventureId") Long adventureId,
                                                  @RequestParam(required = false) String saveName,
                                                  @RequestBody GameStateDto gameStateDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gameSaveService.createSave(adventureId, saveName, gameStateDto));
    }

    @PutMapping("/{adventureId}/autosave")
    public ResponseEntity<Void> updateAutoSave(@PathVariable("adventureId") Long adventureId,
                                               @RequestBody GameStateDto gameStateDto) {
        gameSaveService.updateAutoSave(adventureId, gameStateDto);
        return ResponseEntity.ok().build();
    }

}