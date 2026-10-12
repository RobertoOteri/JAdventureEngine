package com.jadventure.backend.controller;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.service.ActionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<GameActionResultDto> executeAction(@Valid @RequestBody GameActionDto actionDto) {
        return ResponseEntity.ok(actionService.executeAction(actionDto));
    }

    @GetMapping("/item/{itemCode}")
    public ResponseEntity<List<ActionDto>> getActions(@PathVariable("itemCode") String itemCode) {
        return ResponseEntity.ok(actionService.getActionsByItem(itemCode));
    }

    @GetMapping("/{actionCode}")
    public ResponseEntity<ActionDto> getAction(@PathVariable("actionCode") String actionCode) {
        return ResponseEntity.ok(actionService.getActionByCode(actionCode));
    }

    @PostMapping("/{adventureCode}/{sceneCode}/{itemCode}")
    public ResponseEntity<ActionDto> addAction(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode,
            @Valid @RequestBody ActionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actionService.addActionToItem(adventureCode, sceneCode, itemCode, dto));
    }

    @DeleteMapping("/{actionCode}")
    public ResponseEntity<Void> deleteAction(@PathVariable("actionCode") String actionCode) {
        actionService.deleteAction(actionCode);
        return ResponseEntity.noContent().build();
    }
}