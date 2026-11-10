package com.jadventure.backend.controller;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.service.ActionService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actions")
@Log4j2
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<GameActionResultDto> executeAction(@Valid @RequestBody GameActionDto actionDto) {
        log.info("Received POST request to execute an action");
        GameActionResultDto result = actionService.executeAction(actionDto);
        log.info("Action executed successfully");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<ActionDto>> getActionsByItemId(@PathVariable Long itemId) {
        log.info("Received GET request for actions of item {}", itemId);
        List<ActionDto> actions = actionService.getActionsByItemId(itemId);
        log.info("Returning {} actions for item {}", actions.size(), itemId);
        return ResponseEntity.ok(actions);
    }

    @GetMapping("/{actionId}")
    public ResponseEntity<ActionDto> getActionById(@PathVariable Long actionId) {
        log.info("Received GET request for action {}", actionId);
        ActionDto action = actionService.getActionById(actionId);
        log.info("Returning action {}", action);
        return ResponseEntity.ok(action);
    }

    @PutMapping
    public ResponseEntity<ActionDto> updateAction(
            @Valid @RequestBody ActionDto actionDto) {
        log.info("Received PUT request to update action {}", actionDto);
        ActionDto updated = actionService.updateAction(actionDto);
        log.info("Action updated successfully: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{actionId}")
    public ResponseEntity<Void> deleteActionById(@PathVariable Long actionId) {
        log.info("Received DELETE request for action {}", actionId);
        actionService.deleteActionById(actionId);
        log.info("Action {} deleted successfully", actionId);
        return ResponseEntity.noContent().build();
    }
}
