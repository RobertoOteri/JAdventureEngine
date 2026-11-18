package com.jadventure.backend.service;

import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.DialogueNodeMapper;
import com.jadventure.backend.model.DialogueNode;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.repository.DialogueNodeRepository;
import com.jadventure.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Log4j2
public class DialogueNodeService {

    private final DialogueNodeRepository nodeRepository;
    private final ItemRepository itemRepository;
    private final DialogueNodeMapper dialogueNodeMapper;
    private final DialogueChoiceService dialogueChoiceService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<DialogueNodeDto> findByItem(Long itemId) {
        log.info("Executing findByItem with itemId: {}", itemId);
        Item item = findItem(itemId);
        authService.validateOwnership(item.getGraphicAdventure().getAuthor().getUsername());
        List<DialogueNodeDto> nodes = dialogueNodeMapper.toDtoList(item.getDialogueNodes());
        log.info("Executed findByItem: found {} dialogue nodes for item {}", nodes.size(), itemId);
        return nodes;
    }

    @Transactional
    public List<DialogueNodeDto> saveAll(Long itemId, List<DialogueNodeDto> dtos) {
        log.info("Executing saveAll with itemId: {}, number of nodes: {}", itemId, dtos.size());
        Item item = findItem(itemId);

        authService.validateEditable(
                item.getGraphicAdventure().getAuthor().getUsername(),
                item.getGraphicAdventure().getStatus());

        Long adventureId = item.getGraphicAdventure().getId();

        Map<String, DialogueNode> existing = item.getDialogueNodes().stream()
                .collect(Collectors.toMap(DialogueNode::getCode, Function.identity()));

        Map<String, DialogueNode> saved = new LinkedHashMap<>();
        dtos.forEach(dto -> {
            DialogueNode node = existing.get(dto.getCode());
            if (node == null) {
                node = dialogueNodeMapper.toEntity(dto);
                node.setItem(item);
                item.getDialogueNodes().add(node);
            } else {
                dialogueNodeMapper.updateEntity(dto, node);
            }
            saved.put(dto.getCode(), node);
        });

        itemRepository.flush();

        dtos.forEach(dto -> linkTargets(adventureId, dto, saved.get(dto.getCode()), saved));

        List<DialogueNode> removed = existing.values().stream()
                .filter(node -> !saved.containsKey(node.getCode()))
                .toList();

        if (!removed.isEmpty()) {
            dialogueChoiceService.detachTargets(removed.stream().map(DialogueNode::getId).toList());
            item.getDialogueNodes().removeAll(removed);
        }

        List<DialogueNodeDto> result = dialogueNodeMapper.toDtoList(item.getDialogueNodes());
        log.info("Executed saveAll for item {}: {} nodes saved, {} nodes removed", itemId, result.size(), removed.size());
        return result;
    }

    private Item findItem(Long itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    log.error("Item with id {} not found", itemId);
                    return new ResourceNotFoundException("error.item.notFoundById", itemId);
                });
    }

    private void linkTargets(Long adventureId, DialogueNodeDto dto, DialogueNode node,
                             Map<String, DialogueNode> saved) {
        IntStream.range(0, dto.getChoices().size()).forEach(i ->
                node.getChoices().get(i).setNextNode(
                        resolveTarget(adventureId, dto.getChoices().get(i).getNextNodeCode(), saved)));
    }

    private DialogueNode resolveTarget(Long adventureId, String code, Map<String, DialogueNode> saved) {
        if (code == null || code.isBlank()) {
            return null;
        }
        DialogueNode node = saved.get(code);
        if (node != null) {
            return node;
        }
        return nodeRepository.findByCodeAndItemGraphicAdventureId(code, adventureId)
                .orElseThrow(() -> {
                    log.error("Target dialogue node {} not found in adventure {}", code, adventureId);
                    return new ResourceNotFoundException("error.dialogue.targetNodeNotFound", code);
                });
    }
}
