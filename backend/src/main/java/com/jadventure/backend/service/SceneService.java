package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.SceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final SceneMapper sceneMapper;

    private final GraphicAdventureService graphicAdventureService;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public SceneService(SceneRepository sceneRepository,
                        SceneMapper sceneMapper,
                        GraphicAdventureService graphicAdventureService,
                        FileStorageService fileStorageService,
                        AuthService authService) {
        this.sceneRepository = sceneRepository;
        this.sceneMapper = sceneMapper;
        this.graphicAdventureService = graphicAdventureService;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
    }

    @Transactional
    public SceneDto createScene(String adventureCode, SceneDto dto, MultipartFile backgroundFile) {
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        authService.validateOwnership(adventureDto.getAuthorUsername());

        String sceneCode = dto.getCode();
        if (sceneCode == null || sceneCode.isBlank()) {
            throw new IllegalArgumentException("Codice scena obbligatorio");
        }

        if (sceneRepository.existsByGraphicAdventureCodeAndCode(adventureCode, sceneCode)) {
            throw new IllegalArgumentException("Scena già esistente: " + sceneCode);
        }

        String backgroundUrl = fileStorageService.storeSceneBackground(adventureCode, sceneCode, backgroundFile);

        Scene scene = sceneMapper.toEntity(dto, adventureDto);
        scene.setBackgroundImageUrl(backgroundUrl);
        if (scene.getItems() == null) {
            scene.setItems(new ArrayList<>());
        }

        Scene savedScene = sceneRepository.save(scene);

        boolean currentInitialExists = adventureDto.getInitialSceneCode() != null
                && !adventureDto.getInitialSceneCode().isBlank()
                && sceneRepository.existsByGraphicAdventureCodeAndCode(adventureCode, adventureDto.getInitialSceneCode());

        if (dto.isSetAsInitial() || !currentInitialExists) {
            graphicAdventureService.updateInitialSceneCode(adventureCode, savedScene.getCode());
        }

        return sceneMapper.toDto(savedScene);
    }

    @Transactional(readOnly = true)
    public List<SceneDto> getScenesByAdventure(String adventureCode) {
        if (!graphicAdventureService.existsByCode(adventureCode)) {
            throw new ResourceNotFoundException("Avventura non trovata: " + adventureCode);
        }
        return sceneMapper.toDtoList(sceneRepository.findAllByGraphicAdventureCode(adventureCode));
    }

    @Transactional(readOnly = true)
    public SceneDto getSceneByCode(String adventureCode, String sceneCode) {
        Scene scene = sceneRepository.findByGraphicAdventureCodeAndCode(adventureCode, sceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata: " + sceneCode));
        return sceneMapper.toDto(scene);
    }

    @Transactional
    public void deleteScene(String adventureCode, String sceneCode) {
        Scene scene = sceneRepository.findByGraphicAdventureCodeAndCode(adventureCode, sceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata: " + sceneCode));

        authService.validateOwnership(scene.getGraphicAdventure().getAuthor().getUsername());

        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        if (sceneCode.equals(adventureDto.getInitialSceneCode())) {
            graphicAdventureService.updateInitialSceneCode(adventureCode, null);
        }

        sceneRepository.delete(scene);
    }
}