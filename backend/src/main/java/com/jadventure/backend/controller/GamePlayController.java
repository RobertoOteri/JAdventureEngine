package com.jadventure.backend.controller;

import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.service.GamePlayService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game")
public class GamePlayController {

    private final GamePlayService gamePlayService;

    public GamePlayController(GamePlayService gamePlayService) {
        this.gamePlayService = gamePlayService;
    }

    @PostMapping("/adventure/{adventureCode}")
    public ResponseEntity<GameStateDto> startNewGame(@PathVariable("adventureCode") String adventureCode) {
        GameStateDto state = gamePlayService.startNewGame(adventureCode);
        return ResponseEntity.status(HttpStatus.CREATED).body(state);
    }

    @GetMapping("/adventure/{adventureCode}/continue")
    public ResponseEntity<GameStateDto> continueGame(@PathVariable("adventureCode") String adventureCode) {
        GameStateDto state = gamePlayService.continueGame(adventureCode);
        return ResponseEntity.ok(state);
    }

    @GetMapping("/adventure/{adventureCode}/saves")
    public ResponseEntity<List<GameSaveDto>> getSavesForAdventure(@PathVariable String adventureCode) {
        List<GameSaveDto> saves = gamePlayService.getSavesForAdventure(adventureCode);
        return ResponseEntity.ok(saves);
    }

    @PostMapping("/save/{saveCode}/load")
    public ResponseEntity<GameStateDto> loadGame(@PathVariable("saveCode") String saveCode) {
        GameStateDto state = gamePlayService.loadGame(saveCode);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/save/{saveCode}/action")
    public ResponseEntity<GameActionResultDto> executeAction(
            @PathVariable("saveCode") String saveCode,
            @Valid @RequestBody GameActionDto actionDto) {
        GameActionResultDto result = gamePlayService.executeAction(saveCode, actionDto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/save/{activeSaveCode}")
    public ResponseEntity<GameSaveDto> createSave(
            @PathVariable String activeSaveCode,
            @RequestParam(required = false) String saveName) {
        GameSaveDto saved = gamePlayService.createSave(activeSaveCode, saveName);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }


}
