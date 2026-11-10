package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.service.GamePlayService;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@Log4j2
public class GamePlayController {

    private final GamePlayService gamePlayService;

    public GamePlayController(GamePlayService gamePlayService) {
        this.gamePlayService = gamePlayService;
    }

    @PostMapping("/adventure/{adventureId}")
    public ResponseEntity<GameSaveDto> startNewGame(@PathVariable("adventureId") Long adventureId) {
        log.info("Received POST request to start a new game for adventure {}", adventureId);
        GameSaveDto save = gamePlayService.startNewGame(adventureId);
        log.info("New game started for adventure {} with save {}", adventureId, save.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(save);
    }

    @GetMapping("/adventure/{adventureId}/continue")
    public ResponseEntity<GameSaveDto> continueGame(@PathVariable("adventureId") Long adventureId) {
        log.info("Received GET request to continue the game for adventure {}", adventureId);
        GameSaveDto save = gamePlayService.continueGame(adventureId);
        log.info("Game for adventure {} resumed from save {}", adventureId, save.getCode());
        return ResponseEntity.ok(save);
    }

    @GetMapping("/load/{saveCode}")
    public ResponseEntity<GameSaveDto> loadGame(@PathVariable("saveCode") String saveCode) {
        log.info("Received GET request to load game save {}", saveCode);
        GameSaveDto save = gamePlayService.loadGame(saveCode);
        log.info("Game save {} loaded successfully", saveCode);
        return ResponseEntity.ok(save);
    }
}
