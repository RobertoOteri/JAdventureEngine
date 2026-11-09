package com.jadventure.backend.service;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SceneService {

    private final SceneRepository sceneRepository;
    private final SceneMapper sceneMapper;
    private final ItemMapper itemMapper;
    private final FileStorageUtil fileStorageUtil;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<SceneDto> getScenesByAdventure(Long adventureId) {
        return sceneMapper.toDtoList(sceneRepository.findAllByGraphicAdventureId(adventureId));
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneById(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("error.scene.notFoundById", sceneId));
        return sceneMapper.toDto(scene);
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneByCode(Long adventureId, String sceneCode) {
        Scene scene = sceneRepository.findByGraphicAdventureIdAndCode(adventureId, sceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("error.scene.notFoundByCode", sceneCode));
        return sceneMapper.toDto(scene);
    }

    @Transactional
    public void deleteSceneById(Long sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("error.scene.notFoundById", sceneId));

        authService.validateEditable(
                scene.getGraphicAdventure().getAuthor().getUsername(),
                scene.getGraphicAdventure().getStatus());
        sceneRepository.delete(scene);
    }

    @Transactional
    public ItemDto addItem(Long sceneId, ItemDto itemDto, MultipartFile image) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResourceNotFoundException("error.scene.notFoundById", sceneId));

        GraphicAdventure adventure = scene.getGraphicAdventure();
        authService.validateEditable(adventure.getAuthor().getUsername(), adventure.getStatus());

        if (itemDto.getHotspot() == null || itemDto.getHotspot().getPoints() == null || itemDto.getHotspot().getPoints().isBlank()) {
            throw new InvalidOperationException("error.item.hotspotRequired");
        }

        Item item = itemMapper.toEntity(itemDto);
        item.setGraphicAdventure(adventure);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE,
                    adventure.getCode(), adventure.getVersionNumber(), itemDto.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        }

        scene.getItems().add(item);
        sceneRepository.saveAndFlush(scene);

        return itemMapper.toDto(item);
    }
}