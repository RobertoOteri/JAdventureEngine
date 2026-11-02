package com.jadventure.backend.service;

import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.DialogueNodeMapper;
import com.jadventure.backend.model.DialogueNode;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.repository.DialogueNodeRepository;
import com.jadventure.backend.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class DialogueNodeService {

    private final DialogueNodeRepository nodeRepository;
    private final ItemRepository itemRepository;
    private final DialogueNodeMapper dialogueNodeMapper;
    private final DialogueChoiceService dialogueChoiceService;

    public DialogueNodeService(DialogueNodeRepository nodeRepository,
                               ItemRepository itemRepository,
                               DialogueNodeMapper dialogueNodeMapper,
                               DialogueChoiceService dialogueChoiceService) {
        this.nodeRepository = nodeRepository;
        this.itemRepository = itemRepository;
        this.dialogueNodeMapper = dialogueNodeMapper;
        this.dialogueChoiceService = dialogueChoiceService;
    }

    @Transactional(readOnly = true)
    public List<DialogueNodeDto> findByItem(Long itemId) {
        return dialogueNodeMapper.toDtoList(nodeRepository.findByItemIdOrderById(itemId));
    }

    @Transactional
    public List<DialogueNodeDto> saveAll(Long itemId, List<DialogueNodeDto> dtos) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item non trovato: " + itemId));

        Map<String, DialogueNode> existing = nodeRepository.findByItemIdOrderById(itemId).stream()
                .collect(Collectors.toMap(DialogueNode::getCode, Function.identity()));

        Map<String, DialogueNode> saved = new LinkedHashMap<>();
        dtos.forEach(dto -> {
            DialogueNode node = existing.get(dto.getCode());
            if (node == null) {
                node = dialogueNodeMapper.toEntity(dto);
                node.setItem(item);
            } else {
                dialogueNodeMapper.updateEntity(dto, node);
            }
            saved.put(dto.getCode(), node);
        });

        dtos.forEach(dto -> linkTargets(dto, saved.get(dto.getCode()), saved));

        List<DialogueNode> removed = existing.values().stream()
                .filter(node -> !saved.containsKey(node.getCode()))
                .toList();

        nodeRepository.saveAll(saved.values());
        if (!removed.isEmpty()) {
            dialogueChoiceService.detachTargets(removed.stream().map(DialogueNode::getId).toList());
            nodeRepository.deleteAll(removed);
        }

        return dialogueNodeMapper.toDtoList(nodeRepository.findByItemIdOrderById(itemId));
    }

    private void linkTargets(DialogueNodeDto dto, DialogueNode node, Map<String, DialogueNode> saved) {
        IntStream.range(0, dto.getChoices().size()).forEach(i ->
                node.getChoices().get(i).setNextNode(
                        resolveTarget(dto.getChoices().get(i).getNextNodeCode(), saved)));
    }

    private DialogueNode resolveTarget(String code, Map<String, DialogueNode> saved) {
        if (code == null || code.isBlank()) {
            return null;
        }
        DialogueNode node = saved.get(code);
        if (node != null) {
            return node;
        }
        return nodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Nodo di destinazione inesistente: " + code));
    }
}
