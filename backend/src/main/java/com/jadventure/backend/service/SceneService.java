package com.jadventure.backend.service;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.SceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final SceneMapper sceneMapper;
    private final ItemService itemService;
    private final AuthService authService;

    public SceneService(SceneRepository sceneRepository,
                        SceneMapper sceneMapper,
                        ItemService itemService,
                        AuthService authService) {
        this.sceneRepository = sceneRepository;
        this.sceneMapper = sceneMapper;
        this.itemService = itemService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<SceneDto> getScenesByAdventure(String adventureCode) {
        return sceneMapper.toDtoList(sceneRepository.findAllByGraphicAdventureCode(adventureCode));
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneById(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));
        return sceneMapper.toDto(scene);
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneByCode(String adventureCode, String sceneCode) {
        Scene scene = sceneRepository.findByGraphicAdventureCodeAndCode(adventureCode, sceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata: " + sceneCode));
        return sceneMapper.toDto(scene);
    }

    @Transactional
    public void deleteSceneById(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));

        authService.validateOwnership(scene.getGraphicAdventure().getAuthor().getUsername());
        sceneRepository.delete(scene);
    }

    @Transactional
    public ItemDto addItem(Long sceneId, ItemDto itemDto, MultipartFile image, MultipartFile inventoryImage) {
        return itemService.createItem(sceneId, itemDto, image, inventoryImage);
    }
}