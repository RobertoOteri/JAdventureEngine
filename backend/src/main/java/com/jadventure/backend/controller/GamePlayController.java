package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameStateDto;
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

    @PostMapping("/adventure/{adventureCode}")
    public ResponseEntity<GameStateDto> startNewGame(@PathVariable("adventureCode") String adventureCode) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gamePlayService.startNewGame(adventureCode));
    }

    @GetMapping("/adventure/{adventureCode}/continue")
    public ResponseEntity<GameStateDto> continueGame(@PathVariable("adventureCode") String adventureCode) {
        return ResponseEntity.ok(gamePlayService.continueGame(adventureCode));
    }

    @PostMapping("/load/{saveCode}")
    public ResponseEntity<GameStateDto> loadGame(@PathVariable("saveCode") String saveCode) {
        return ResponseEntity.ok(gamePlayService.loadGame(saveCode));
    }
}