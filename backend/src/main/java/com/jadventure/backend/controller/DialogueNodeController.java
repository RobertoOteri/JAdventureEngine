package com.jadventure.backend.controller;

import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.service.DialogueNodeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dialogues")
public class DialogueNodeController {

    private final DialogueNodeService dialogueNodeService;

    public DialogueNodeController(DialogueNodeService dialogueNodeService) {
        this.dialogueNodeService = dialogueNodeService;
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
}
