package com.jadventure.backend.service;

import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.SceneRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final FileStorageService fileStorageService;
    private final SceneMapper sceneMapper;

    public SceneService(SceneRepository sceneRepository,
                        GraphicAdventureRepository graphicAdventureRepository,
                        FileStorageService fileStorageService,
                        SceneMapper sceneMapper) {
        this.sceneRepository = sceneRepository;
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.fileStorageService = fileStorageService;
        this.sceneMapper = sceneMapper;
    }

    @Transactional
    public SceneDto createScene(String adventureCode, SceneDto dto, MultipartFile backgroundFile) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata: " + adventureCode));

        validateOwnership(adventure);

        String sceneCode = dto.getCode();
        if (sceneCode == null || sceneCode.isBlank()) {
            throw new IllegalArgumentException("Codice scena obbligatorio");
        }

        if (sceneRepository.existsByGraphicAdventureCodeAndCode(adventureCode, sceneCode)) {
            throw new IllegalArgumentException("Scena già esistente: " + sceneCode);
        }

        String backgroundUrl = fileStorageService.storeSceneBackground(adventureCode, sceneCode, backgroundFile);

        Scene scene = Scene.builder()
                .code(sceneCode)
                .name(dto.getName())
                .backgroundImageUrl(backgroundUrl)
                .graphicAdventure(adventure)
                .items(new ArrayList<>())
                .build();

        Scene savedScene = sceneRepository.save(scene);

        boolean currentInitialExists = adventure.getInitialSceneCode() != null
                && !adventure.getInitialSceneCode().isBlank()
                && sceneRepository.existsByGraphicAdventureCodeAndCode(adventureCode, adventure.getInitialSceneCode());

        if (dto.isSetAsInitial() || !currentInitialExists) {
            adventure.setInitialSceneCode(savedScene.getCode());
            graphicAdventureRepository.save(adventure);
        }

        return sceneMapper.toDto(savedScene);
    }

    @Transactional(readOnly = true)
    public List<SceneDto> getScenesByAdventure(String adventureCode) {
        if (!graphicAdventureRepository.existsByCode(adventureCode)) {
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

        validateOwnership(scene.getGraphicAdventure());

        GraphicAdventure adventure = scene.getGraphicAdventure();
        if (sceneCode.equals(adventure.getInitialSceneCode())) {
            adventure.setInitialSceneCode(null);
            graphicAdventureRepository.save(adventure);
        }

        sceneRepository.delete(scene);
    }

    private void validateOwnership(GraphicAdventure adventure) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && !adventure.getAuthor().getUsername().equals(auth.getName())) {
            throw new AccessDeniedException("Accesso negato");
        }
    }
}