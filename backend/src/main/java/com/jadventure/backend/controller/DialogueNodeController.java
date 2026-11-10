package com.jadventure.backend.controller;

import com.jadventure.backend.dto.dialogue.DialogueChoiceRequestDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.service.DialogueGameService;
import com.jadventure.backend.service.DialogueNodeService;
import jakarta.validation.Valid;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dialogues")
@Log4j2
public class DialogueNodeController {

    private final DialogueNodeService dialogueNodeService;
    private final DialogueGameService dialogueGameService;

    public DialogueNodeController(DialogueNodeService dialogueNodeService, DialogueGameService dialogueGameService) {
        this.dialogueNodeService = dialogueNodeService;
        this.dialogueGameService = dialogueGameService;
    }

    @GetMapping("/items/{itemId}")
    public List<DialogueNodeDto> findByItem(@PathVariable Long itemId) {
        log.info("Received GET request for dialogue nodes of item {}", itemId);
        List<DialogueNodeDto> nodes = dialogueNodeService.findByItem(itemId);
        log.info("Returning {} dialogue nodes for item {}", nodes.size(), itemId);
        return nodes;
    }

    @PutMapping("/items/{itemId}")
    public List<DialogueNodeDto> saveAll(@PathVariable Long itemId,
                                         @RequestBody List<DialogueNodeDto> dtos) {
        log.info("Received PUT request to save {} dialogue nodes for item {}", dtos.size(), itemId);
        List<DialogueNodeDto> saved = dialogueNodeService.saveAll(itemId, dtos);
        log.info("Saved {} dialogue nodes for item {}", saved.size(), itemId);
        return saved;
    }

    @PostMapping("/choose")
    public ResponseEntity<GameActionResultDto> choose(@Valid @RequestBody DialogueChoiceRequestDto request) {
        log.info("Received POST request to choose dialogue option {}", request.getChoiceId());
        GameActionResultDto result = dialogueGameService.chooseOption(request);
        log.info("Dialogue option {} processed successfully", request.getChoiceId());
        return ResponseEntity.ok(result);
    }
}
