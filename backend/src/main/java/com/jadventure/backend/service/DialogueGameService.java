package com.jadventure.backend.service;

import com.jadventure.backend.dto.dialogue.DialogueChoiceDto;
import com.jadventure.backend.dto.dialogue.DialogueChoiceRequestDto;
import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.DialogueNodeMapper;
import com.jadventure.backend.repository.DialogueNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class DialogueGameService {

    private final DialogueNodeRepository nodeRepository;
    private final DialogueNodeMapper nodeMapper;
    private final PreconditionService preconditionService;
    private final GameEffectService gameEffectService;
    private final GameSaveService gameSaveService;

    @Transactional
    public DialogueNodeDto openCurrentNode(Long adventureId, GameStateDto state) {
        String nodeCode = state.getCurrentDialogueNodeCode();
        log.info("Executing openCurrentNode with adventureId: {}, nodeCode: {}", adventureId, nodeCode);
        if (nodeCode == null) {
            log.info("Executed openCurrentNode: no active dialogue node, returning null");
            return null;
        }

        DialogueNodeDto node = loadNode(adventureId, nodeCode);
        gameEffectService.applyAll(adventureId, state, node.getEffects());

        if (state.isCompleted()) {
            state.setCurrentDialogueNodeCode(null);
            log.info("Executed openCurrentNode: node {} ended the game, returning null", nodeCode);
            return null;
        }

        if (state.getCurrentDialogueNodeCode() == null) {
            node.setChoices(List.of());
            log.info("Executed openCurrentNode: node {} closed the dialogue, returning node without choices", nodeCode);
            return node;
        }

        List<DialogueChoiceDto> available = node.getChoices().stream()
                .filter(choice -> isAvailable(state, choice))
                .toList();
        node.setChoices(available);

        if (available.isEmpty()) {
            state.setCurrentDialogueNodeCode(null);
        }

        log.info("Executed openCurrentNode: returning node {} with {} available choices", nodeCode, available.size());
        return node;
    }

    @Transactional
    public GameActionResultDto chooseOption(DialogueChoiceRequestDto request) {
        log.info("Executing chooseOption with adventureId: {}, choiceId: {}", request.getAdventureId(), request.getChoiceId());
        Long adventureId = request.getAdventureId();
        GameStateDto state = gameSaveService.loadActiveState(adventureId);

        if (state.getCurrentScene() == null || state.getCurrentDialogueNodeCode() == null) {
            log.error("Cannot choose option {}: no active dialogue", request.getChoiceId());
            throw new InvalidOperationException("error.dialogue.noneActive");
        }

        DialogueChoiceDto choice = loadNode(adventureId, state.getCurrentDialogueNodeCode()).getChoices().stream()
                .filter(c -> request.getChoiceId().equals(c.getId()))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Choice {} does not belong to dialogue node {}", request.getChoiceId(), state.getCurrentDialogueNodeCode());
                    return new InvalidOperationException("error.dialogue.invalidChoice");
                });

        if (!isAvailable(state, choice)) {
            log.error("Choice {} is not available: preconditions not satisfied", request.getChoiceId());
            throw new InvalidOperationException("error.dialogue.choiceUnavailable");
        }

        if (StringUtils.hasText(choice.getNextNodeCode())) {
            state.setCurrentDialogueNodeCode(choice.getNextNodeCode());
        }
        gameEffectService.applyAll(adventureId, state, choice.getEffects());

        DialogueNodeDto nextNode = openCurrentNode(adventureId, state);

        if (!state.isCompleted()) {
            gameSaveService.updateAutoSave(adventureId, state);
        }

        GameActionResultDto result = GameActionResultDto.builder()
                .success(true)
                .state(gameSaveService.toView(state))
                .dialogue(nodeMapper.toGameDto(nextNode))
                .build();
        log.info("Executed chooseOption for choice {}: nextNode: {}, completed: {}",
                request.getChoiceId(), nextNode != null ? nextNode.getCode() : null, state.isCompleted());
        return result;
    }

    @Transactional
    public void closeDialogue(Long adventureId) {
        log.info("Executing closeDialogue with adventureId: {}", adventureId);
        GameStateDto state = gameSaveService.loadActiveState(adventureId);

        if (state.isCompleted() || state.getCurrentDialogueNodeCode() == null) {
            log.info("Executed closeDialogue: no active dialogue on adventure {}", adventureId);
            return;
        }

        state.setCurrentDialogueNodeCode(null);
        gameSaveService.updateAutoSave(adventureId, state);
        log.info("Executed closeDialogue: dialogue closed on adventure {}", adventureId);
    }

    private DialogueNodeDto loadNode(Long adventureId, String code) {
        return nodeMapper.toDto(nodeRepository.findByCodeAndItemGraphicAdventureId(code, adventureId)
                .orElseThrow(() -> {
                    log.error("Dialogue node {} not found in adventure {}", code, adventureId);
                    return new ResourceNotFoundException("error.dialogue.nodeNotFound", code);
                }));
    }

    private boolean isAvailable(GameStateDto state, DialogueChoiceDto choice) {
        return choice.getPreconditions().stream()
                .allMatch(precondition -> preconditionService.isSatisfied(state, precondition, null));
    }
}
