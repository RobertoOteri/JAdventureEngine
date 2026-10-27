package com.jadventure.backend.service;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.SceneRepository;
import com.jadventure.backend.util.FileStorageUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final SceneMapper sceneMapper;
    private final ItemMapper itemMapper;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    public SceneService(SceneRepository sceneRepository,
                        SceneMapper sceneMapper,
                        ItemMapper itemMapper,
                        FileStorageUtil fileStorageUtil,
                        AuthService authService) {
        this.sceneRepository = sceneRepository;
        this.sceneMapper = sceneMapper;
        this.itemMapper = itemMapper;
        this.fileStorageUtil = fileStorageUtil;
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
    public ItemDto addItem(Long sceneId, ItemDto itemDto, MultipartFile image) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata con ID: " + sceneId));

        GraphicAdventure adventure = scene.getGraphicAdventure();
        authService.validateOwnership(adventure.getAuthor().getUsername());

        if (itemDto.getHotspot() == null || itemDto.getHotspot().getPoints() == null || itemDto.getHotspot().getPoints().isBlank()) {
            throw new IllegalArgumentException("Un oggetto aggiunto alla scena deve avere un hotspot con dei punti validi");
        }

        Item item = itemMapper.toEntity(itemDto);
        item.setGraphicAdventure(adventure);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE, adventure.getCode(), itemDto.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        }

        scene.getItems().add(item);
        sceneRepository.saveAndFlush(scene);

        return itemMapper.toDto(item);
    }
}