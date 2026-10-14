package com.jadventure.backend.controller;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.service.ActionService;
import jakarta.validation.Valid;
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

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ActionDto>> getActionsByItemId(@PathVariable Long itemId) {
        return ResponseEntity.ok(actionService.getActionsByItemId(itemId));
    }

    @GetMapping("/{actionId}")
    public ResponseEntity<ActionDto> getActionById(@PathVariable Long actionId) {
        return ResponseEntity.ok(actionService.getActionById(actionId));
    }

    @PutMapping("/{actionId}")
    public ResponseEntity<ActionDto> updateAction(
            @PathVariable Long actionId,
            @Valid @RequestBody ActionDto actionDto) {
        return ResponseEntity.ok(actionService.updateActionById(actionId, actionDto));
    }

    @DeleteMapping("/{actionId}")
    public ResponseEntity<Void> deleteActionById(@PathVariable Long actionId) {
        actionService.deleteActionById(actionId);
        return ResponseEntity.noContent().build();
    }
}