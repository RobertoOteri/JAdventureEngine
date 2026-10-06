package com.jadventure.backend.controller;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.service.ActionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adventures/{adventureCode}/scenes/{sceneCode}/items/{itemCode}/actions")
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @GetMapping
    public ResponseEntity<List<ActionDto>> getActions(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode) {
        return ResponseEntity.ok(actionService.getActionsByItem(adventureCode, sceneCode, itemCode));
    }

    @GetMapping("/{actionCode}")
    public ResponseEntity<ActionDto> getAction(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode,
            @PathVariable("actionCode") String actionCode) {
        return ResponseEntity.ok(actionService.getActionByCode(adventureCode, sceneCode, itemCode, actionCode));
    }

    @PostMapping
    public ResponseEntity<ActionDto> addAction(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode,
            @Valid @RequestBody ActionDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actionService.addActionToItem(adventureCode, sceneCode, itemCode, dto));
    }

    @DeleteMapping("/{actionCode}")
    public ResponseEntity<Void> deleteAction(
            @PathVariable("adventureCode") String adventureCode,
            @PathVariable("sceneCode") String sceneCode,
            @PathVariable("itemCode") String itemCode,
            @PathVariable("actionCode") String actionCode) {

        actionService.deleteAction(adventureCode, sceneCode, itemCode, actionCode);
        return ResponseEntity.noContent().build();
    }
}