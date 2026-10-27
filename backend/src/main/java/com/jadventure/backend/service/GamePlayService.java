package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.GameState;
import com.jadventure.backend.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GamePlayService {

    private final GraphicAdventureService graphicAdventureService;
    private final GameSaveService gameSaveService;
    private final AuthService authService;
    private final SceneService sceneService;
    private final GameSaveMapper gameSaveMapper;

    public GamePlayService(GraphicAdventureService graphicAdventureService,
                           GameSaveService gameSaveService,
                           AuthService authService,
                           SceneService sceneService,
                           GameSaveMapper gameSaveMapper) {
        this.graphicAdventureService = graphicAdventureService;
        this.gameSaveService = gameSaveService;
        this.authService = authService;
        this.sceneService = sceneService;
        this.gameSaveMapper = gameSaveMapper;
    }

    @Transactional
    public GameSaveDto startNewGame(String adventureCode) {
        User user = authService.getCurrentUser();
        GraphicAdventureDto adventure = graphicAdventureService.getAdventureByCode(adventureCode);

        gameSaveService.deleteSavesForAdventure(user.getUsername(), adventureCode);

        String initialSceneCode = adventure.getInitialSceneCode();
        if (initialSceneCode == null || initialSceneCode.isBlank()) {
            throw new ResourceNotFoundException("L'avventura non ha una scena iniziale configurata");
        }

        SceneDto initialScene = sceneService.getSceneByCode(adventureCode, initialSceneCode);

        Set<String> visibleItems = (initialScene.getItems() == null)
                ? Collections.emptySet()
                : initialScene.getItems().stream()
                .filter(item -> item.getHotspot() != null && Boolean.TRUE.equals(item.getHotspot().getInitiallyVisible()))
                .map(ItemDto::getCode)
                .collect(Collectors.toSet());

        GameStateDto initialState = GameStateDto.builder()
                .currentScene(initialScene)
                .visibleItemCodes(visibleItems)
                .build();

        GameSaveDto saveDto = gameSaveService.createSave(adventureCode, "Salvataggio automatico", initialState);

        GameSave saveEntity = gameSaveService.findSaveByUser(saveDto.getCode());
        saveEntity.setAutoSave(true);

        return loadGame(saveDto.getCode());
    }

    @Transactional(readOnly = true)
    public GameSaveDto continueGame(String adventureCode) {
        User user = authService.getCurrentUser();
        GameSave lastSave = gameSaveService.findLatestSave(user.getUsername(), adventureCode);
        return buildGameSaveDto(lastSave);
    }

    @Transactional(readOnly = true)
    public GameSaveDto loadGame(String saveCode) {
        GameSave save = gameSaveService.findSaveByUser(saveCode);
        return buildGameSaveDto(save);
    }

    @Transactional(readOnly = true)
    public GameSaveDto buildGameSaveDto(GameSave save) {
        String adventureCode = save.getGraphicAdventure().getCode();
        GameState state = save.getGameState();

        GameSaveDto dto = gameSaveMapper.toDto(save);

        if (dto.getGameState() != null && state != null) {
            SceneDto sceneDto = sceneService.getSceneByCode(adventureCode, state.getCurrentSceneCode());
            dto.getGameState().setCurrentScene(sceneDto);
        }

        return dto;
    }
}