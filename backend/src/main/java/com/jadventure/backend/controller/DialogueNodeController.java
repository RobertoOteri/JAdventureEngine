package com.jadventure.backend.controller;

import com.jadventure.backend.dto.dialogue.DialogueChoiceRequestDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.service.DialogueGameService;
import com.jadventure.backend.service.DialogueNodeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dialogues")
public class DialogueNodeController {

    private final DialogueNodeService dialogueNodeService;
    private final DialogueGameService dialogueGameService;

    public DialogueNodeController(DialogueNodeService dialogueNodeService, DialogueGameService dialogueGameService) {
        this.dialogueNodeService = dialogueNodeService;
        this.dialogueGameService = dialogueGameService;
    }

    @GetMapping("/items/{itemId}")
    public List<DialogueNodeDto> findByItem(@PathVariable Long itemId) {
        return dialogueNodeService.findByItem(itemId);
    }

    @PutMapping("/items/{itemId}")
    public List<DialogueNodeDto> saveAll(@PathVariable Long itemId,
                                         @RequestBody List<DialogueNodeDto> dtos) {
        return dialogueNodeService.saveAll(itemId, dtos);
    }

    @PostMapping("/choose")
    public ResponseEntity<GameActionResultDto> choose(@Valid @RequestBody DialogueChoiceRequestDto request) {
        return ResponseEntity.ok(dialogueGameService.chooseOption(request));
    }
}
