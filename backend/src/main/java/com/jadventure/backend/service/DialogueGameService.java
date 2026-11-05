package com.jadventure.backend.service;

import com.jadventure.backend.dto.dialogue.DialogueChoiceDto;
import com.jadventure.backend.dto.dialogue.DialogueChoiceRequestDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.DialogueNodeMapper;
import com.jadventure.backend.repository.DialogueNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DialogueGameService {

    private final DialogueNodeRepository nodeRepository;
    private final DialogueNodeMapper nodeMapper;
    private final PreconditionService preconditionService;
    private final GameEffectService gameEffectService;
    private final GameSaveService gameSaveService;

    @Transactional
    public DialogueNodeDto openCurrentNode(Long adventureId, GameStateDto state) {
        String nodeCode = state.getCurrentDialogueNodeCode();
        if (nodeCode == null) {
            return null;
        }

        DialogueNodeDto node = loadNode(adventureId, nodeCode);
        gameEffectService.applyAll(adventureId, state, node.getEffects());

        if (state.isCompleted()) {
            state.setCurrentDialogueNodeCode(null);
            return null;
        }

        if (state.getCurrentDialogueNodeCode() == null) {
            node.setChoices(List.of());
            return node;
        }

        List<DialogueChoiceDto> available = node.getChoices().stream()
                .filter(choice -> isAvailable(state, choice))
                .toList();
        node.setChoices(available);

        if (available.isEmpty()) {
            state.setCurrentDialogueNodeCode(null);
        }

        return node;
    }

    @Transactional
    public GameActionResultDto chooseOption(DialogueChoiceRequestDto request) {
        Long adventureId = request.getAdventureId();
        GameStateDto state = request.getGameState();

        if (state.getCurrentScene() == null || state.getCurrentDialogueNodeCode() == null) {
            throw new IllegalArgumentException("Nessun dialogo in corso");
        }

        DialogueChoiceDto choice = loadNode(adventureId, state.getCurrentDialogueNodeCode()).getChoices().stream()
                .filter(c -> request.getChoiceId().equals(c.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Scelta non valida per il nodo corrente"));

        if (!isAvailable(state, choice)) {
            throw new IllegalArgumentException("Scelta non disponibile");
        }

        if (StringUtils.hasText(choice.getNextNodeCode())) {
            state.setCurrentDialogueNodeCode(choice.getNextNodeCode());
        }
        gameEffectService.applyAll(adventureId, state, choice.getEffects());

        DialogueNodeDto nextNode = openCurrentNode(adventureId, state);

        if (!state.isCompleted()) {
            gameSaveService.updateAutoSave(adventureId, state);
        }

        return GameActionResultDto.builder()
                .success(true)
                .state(state)
                .dialogue(nextNode)
                .build();
    }

    private DialogueNodeDto loadNode(Long adventureId, String code) {
        return nodeMapper.toDto(nodeRepository.findByCodeAndItemGraphicAdventureId(code, adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Nodo di dialogo non trovato: " + code)));
    }

    private boolean isAvailable(GameStateDto state, DialogueChoiceDto choice) {
        return choice.getPreconditions().stream()
                .allMatch(precondition -> preconditionService.isSatisfied(state, precondition, null));
    }
}