package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.service.GamePlayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
public class GamePlayController {

    private final GamePlayService gamePlayService;

    public GamePlayController(GamePlayService gamePlayService) {
        this.gamePlayService = gamePlayService;
    }

    @PostMapping("/adventure/{adventureId}")
    public ResponseEntity<GameSaveDto> startNewGame(@PathVariable("adventureId") Long adventureId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gamePlayService.startNewGame(adventureId));
    }

    @GetMapping("/adventure/{adventureId}/continue")
    public ResponseEntity<GameSaveDto> continueGame(@PathVariable("adventureId") Long adventureId) {
        return ResponseEntity.ok(gamePlayService.continueGame(adventureId));
    }

    @GetMapping("/load/{saveCode}")
    public ResponseEntity<GameSaveDto> loadGame(@PathVariable("saveCode") String saveCode) {
        return ResponseEntity.ok(gamePlayService.loadGame(saveCode));
    }
}