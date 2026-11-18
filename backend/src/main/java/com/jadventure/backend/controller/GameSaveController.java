package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.service.GameSaveService;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saves")
@Log4j2
public class GameSaveController {

    private final GameSaveService gameSaveService;

    public GameSaveController(GameSaveService gameSaveService) {
        this.gameSaveService = gameSaveService;
    }

    @GetMapping("/saveGame/{adventureId}")
    public ResponseEntity<List<GameSaveDto>> getSavesForAdventure(@PathVariable("adventureId") Long adventureId) {
        log.info("Received GET request for the list of saves of adventure {}", adventureId);
        List<GameSaveDto> saves = gameSaveService.getSavesForAdventure(adventureId);
        log.info("Returning {} saves for adventure {}", saves.size(), adventureId);
        return ResponseEntity.ok(saves);
    }

    @GetMapping("/{saveCode}")
    public ResponseEntity<GameSaveDto> getSave(@PathVariable("saveCode") String saveCode) {
        log.info("Received GET request for save {}", saveCode);
        GameSaveDto save = gameSaveService.getSaveByCode(saveCode);
        log.info("Returning save {}", saveCode);
        return ResponseEntity.ok(save);
    }


    @PostMapping("/{adventureId}")
    public ResponseEntity<GameSaveDto> createSave(@PathVariable("adventureId") Long adventureId,
                                                  @RequestParam(required = false) String saveName) {
        log.info("Received POST request to create save '{}' for adventure {}", saveName, adventureId);
        GameSaveDto created = gameSaveService.createSave(adventureId, saveName);
        log.info("Save created for adventure {} with code {}", adventureId, created.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

}
