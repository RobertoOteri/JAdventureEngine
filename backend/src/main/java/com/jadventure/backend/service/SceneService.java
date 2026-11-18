package com.jadventure.backend.service;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ConflictException;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.SceneRepository;
import com.jadventure.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class SceneService {

    private final SceneRepository sceneRepository;
    private final ItemService itemService;
    private final SceneMapper sceneMapper;
    private final ItemMapper itemMapper;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public void validateCodeAvailable(Long adventureId, String code) {
        if (sceneRepository.existsByGraphicAdventureIdAndCode(adventureId, code)) {
            log.error("Scene code {} already in use in adventure {}", code, adventureId);
            throw new ConflictException("error.scene.codeTaken", code);
        }
    }

    public List<SceneDto> getScenesByAdventure(Long adventureId) {
        log.info("Executing getScenesByAdventure with adventureId: {}", adventureId);
        List<SceneDto> scenes = sceneMapper.toDtoList(sceneRepository.findAllByGraphicAdventureId(adventureId));
        log.info("Executed getScenesByAdventure: found {} scenes for adventure {}", scenes.size(), adventureId);
        return scenes;
    }

    @Transactional(readOnly = true)
    public List<SceneDto> getOwnedScenesByAdventure(Long adventureId) {
        log.info("Executing getOwnedScenesByAdventure with adventureId: {}", adventureId);
        List<Scene> scenes = sceneRepository.findAllByGraphicAdventureId(adventureId);
        scenes.stream().findFirst().ifPresent(scene ->
                authService.validateOwnership(scene.getGraphicAdventure().getAuthor().getUsername()));
        List<SceneDto> sceneDtos = sceneMapper.toDtoList(scenes);
        log.info("Executed getOwnedScenesByAdventure: found {} scenes for adventure {}", sceneDtos.size(), adventureId);
        return sceneDtos;
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneById(Long sceneId) {
        log.info("Executing getSceneById with sceneId: {}", sceneId);
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> {
                    log.error("Scene with id {} not found", sceneId);
                    return new ResourceNotFoundException("error.scene.notFoundById", sceneId);
                });
        authService.validateOwnership(scene.getGraphicAdventure().getAuthor().getUsername());
        SceneDto sceneDto = sceneMapper.toDto(scene);
        log.info("Executed getSceneById: returning scene {} with code {}", sceneDto.getId(), sceneDto.getCode());
        return sceneDto;
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneByCode(Long adventureId, String sceneCode) {
        log.info("Executing getSceneByCode with adventureId: {}, sceneCode: {}", adventureId, sceneCode);
        Scene scene = sceneRepository.findByGraphicAdventureIdAndCode(adventureId, sceneCode)
                .orElseThrow(() -> {
                    log.error("Scene with code {} not found in adventure {}", sceneCode, adventureId);
                    return new ResourceNotFoundException("error.scene.notFoundByCode", sceneCode);
                });
        SceneDto sceneDto = sceneMapper.toDto(scene);
        log.info("Executed getSceneByCode: returning scene {} with {} items", sceneDto.getCode(),
                sceneDto.getItems() != null ? sceneDto.getItems().size() : 0);
        return sceneDto;
    }

    @Transactional
    public void deleteSceneById(Long sceneId) {
        log.info("Executing deleteSceneById with sceneId: {}", sceneId);
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> {
                    log.error("Scene with id {} not found", sceneId);
                    return new ResourceNotFoundException("error.scene.notFoundById", sceneId);
                });

        authService.validateEditable(
                scene.getGraphicAdventure().getAuthor().getUsername(),
                scene.getGraphicAdventure().getStatus());
        sceneRepository.delete(scene);
        log.info("Executed deleteSceneById: scene {} deleted", sceneId);
    }

    @Transactional
    public ItemDto addItem(Long sceneId, ItemDto itemDto, MultipartFile image) {
        log.info("Executing addItem with sceneId: {}, itemCode: {}, image provided: {}",
                sceneId, itemDto.getCode(), image != null && !image.isEmpty());
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> {
                    log.error("Scene with id {} not found", sceneId);
                    return new ResourceNotFoundException("error.scene.notFoundById", sceneId);
                });

        GraphicAdventure adventure = scene.getGraphicAdventure();
        authService.validateEditable(adventure.getAuthor().getUsername(), adventure.getStatus());

        if (itemDto.getHotspot() == null || itemDto.getHotspot().getPoints() == null || itemDto.getHotspot().getPoints().isBlank()) {
            log.error("Cannot add item {} to scene {}: hotspot is required", itemDto.getCode(), sceneId);
            throw new InvalidOperationException("error.item.hotspotRequired");
        }

        itemService.validateCodeAvailable(adventure.getId(), itemDto.getCode());

        Item item = itemMapper.toEntity(itemDto);
        item.setGraphicAdventure(adventure);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE,
                    adventure.getCode(), adventure.getVersionNumber(), itemDto.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        }

        scene.getItems().add(item);
        sceneRepository.saveAndFlush(scene);

        ItemDto created = itemMapper.toDto(item);
        log.info("Executed addItem: item {} created with code {} in scene {}", created.getId(), created.getCode(), sceneId);
        return created;
    }
}