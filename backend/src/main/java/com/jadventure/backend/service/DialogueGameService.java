package com.jadventure.backend.service;

import com.jadventure.backend.dto.dialogue.DialogueChoiceDto;
import com.jadventure.backend.dto.dialogue.DialogueChoiceRequestDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.DialogueNodeMapper;
import com.jadventure.backend.repository.DialogueNodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DialogueGameService {

    private final DialogueNodeRepository nodeRepository;
    private final DialogueNodeMapper nodeMapper;
    private final PreconditionService preconditionService;
    private final GameEffectService gameEffectService;
    private final GameSaveService gameSaveService;

    public DialogueGameService(DialogueNodeRepository nodeRepository,
                               DialogueNodeMapper nodeMapper,
                               PreconditionService preconditionService,
                               GameEffectService gameEffectService,
                               GameSaveService gameSaveService) {
        this.nodeRepository = nodeRepository;
        this.nodeMapper = nodeMapper;
        this.preconditionService = preconditionService;
        this.gameEffectService = gameEffectService;
        this.gameSaveService = gameSaveService;
    }

    @Transactional
    public DialogueNodeDto openCurrentNode(String adventureCode, GameStateDto state) {
        String nodeCode = state.getCurrentDialogueNodeCode();
        if (nodeCode == null) {
            return null;
        }

        DialogueNodeDto node = loadNode(nodeCode);
        gameEffectService.applyAll(adventureCode, state, node.getEffects());

        if (state.isCompleted()) {
            state.setCurrentDialogueNodeCode(null);
            return null;
        }

        node.setChoices(node.getChoices().stream()
                .filter(choice -> isAvailable(state, choice))
                .toList());
        return node;
    }

    @Transactional
    public GameActionResultDto chooseOption(DialogueChoiceRequestDto request) {
        String adventureCode = request.getAdventureCode();
        GameStateDto state = request.getGameState();

        if (state.getCurrentScene() == null || state.getCurrentDialogueNodeCode() == null) {
            throw new IllegalArgumentException("Nessun dialogo in corso");
        }

        DialogueChoiceDto choice = loadNode(state.getCurrentDialogueNodeCode()).getChoices().stream()
                .filter(c -> request.getChoiceId().equals(c.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Scelta non valida per il nodo corrente"));

        if (!isAvailable(state, choice)) {
            throw new IllegalArgumentException("Scelta non disponibile");
        }

        state.setCurrentDialogueNodeCode(choice.getNextNodeCode());
        gameEffectService.applyAll(adventureCode, state, choice.getEffects());

        DialogueNodeDto nextNode = openCurrentNode(adventureCode, state);

        if (!state.isCompleted()) {
            gameSaveService.updateAutoSave(adventureCode, state);
        }

        return GameActionResultDto.builder()
                .success(true)
                .state(state)
                .dialogue(nextNode)
                .build();
    }

    private DialogueNodeDto loadNode(String code) {
        return nodeMapper.toDto(nodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Nodo di dialogo non trovato: " + code)));
    }

    private boolean isAvailable(GameStateDto state, DialogueChoiceDto choice) {
        return choice.getPreconditions().stream()
                .allMatch(precondition -> preconditionService.isSatisfied(state, precondition, null));
    }
}