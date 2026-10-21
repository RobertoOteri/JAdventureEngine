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

    @GetMapping("/saveGame/{adventureCode}")
    public ResponseEntity<List<GameSaveDto>> getSavesForAdventure(@PathVariable("adventureCode") String adventureCode) {
        return ResponseEntity.ok(gameSaveService.getSavesForAdventure(adventureCode));
    }

    @GetMapping("/{saveCode}")
    public ResponseEntity<GameSaveDto> getSave(@PathVariable("saveCode") String saveCode) {
        return ResponseEntity.ok(gameSaveService.getSaveByCode(saveCode));
    }


    @PostMapping("/{adventureCode}")
    public ResponseEntity<GameSaveDto> createSave(@PathVariable("adventureCode") String adventureCode,
                                                  @RequestParam(required = false) String saveName,
                                                  @RequestBody GameStateDto gameStateDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gameSaveService.createSave(adventureCode, saveName, gameStateDto));
    }

    @PutMapping("/{adventureCode}/autosave")
    public ResponseEntity<Void> updateAutoSave(@PathVariable("adventureCode") String adventureCode,
                                               @RequestBody GameStateDto gameStateDto) {
        gameSaveService.updateAutoSave(adventureCode, gameStateDto);
        return ResponseEntity.ok().build();
    }

}