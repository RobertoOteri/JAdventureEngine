package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.GameState;
import com.jadventure.backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class GamePlayService {

    private final GraphicAdventureService graphicAdventureService;
    private final GameSaveService gameSaveService;
    private final AuthService authService;
    private final SceneService sceneService;
    private final GameSaveMapper gameSaveMapper;

    @Transactional
    public GameSaveDto startNewGame(Long adventureId) {
        log.info("Executing startNewGame with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        GraphicAdventureDto adventure = graphicAdventureService.getAdventureById(adventureId);

        gameSaveService.deleteSavesForAdventure(user.getUsername(), adventureId);

        String initialSceneCode = adventure.getInitialSceneCode();
        if (initialSceneCode == null || initialSceneCode.isBlank()) {
            log.error("Cannot start a new game: adventure {} has no initial scene", adventureId);
            throw new ResourceNotFoundException("error.adventure.noStartScene");
        }

        Set<String> visibleItems = sceneService.getScenesByAdventure(adventureId).stream()
                .filter(scene -> scene.getItems() != null)
                .flatMap(scene -> scene.getItems().stream())
                .filter(item -> item.getHotspot() != null && Boolean.TRUE.equals(item.getHotspot().getInitiallyVisible()))
                .map(ItemDto::getCode)
                .collect(Collectors.toSet());

        gameSaveService.createAutoSave(adventureId, initialSceneCode, visibleItems);

        GameSaveDto newGame = continueGame(adventureId);
        log.info("Executed startNewGame: user {} started adventure {} from scene {} with save {}",
                user.getUsername(), adventureId, initialSceneCode, newGame.getCode());
        return newGame;
    }

    @Transactional
    public GameSaveDto continueGame(Long adventureId) {
        log.info("Executing continueGame with adventureId: {}", adventureId);
        GameSaveDto save = buildGameSaveDto(gameSaveService.resumeAutoSave(adventureId));
        log.info("Executed continueGame: adventure {} resumed from autosave {}", adventureId, save.getCode());
        return save;
    }

    @Transactional
    public GameSaveDto loadGame(String saveCode) {
        log.info("Executing loadGame with saveCode: {}", saveCode);
        GameSaveDto save = buildGameSaveDto(gameSaveService.restoreSave(saveCode));
        log.info("Executed loadGame: save {} restored into autosave {}", saveCode, save.getCode());
        return save;
    }

    @Transactional
    public void pauseGame(Long adventureId) {
        log.info("Executing pauseGame with adventureId: {}", adventureId);
        gameSaveService.pauseTimer(adventureId);
        log.info("Executed pauseGame for adventure {}", adventureId);
    }

    @Transactional
    public void resumeGame(Long adventureId) {
        log.info("Executing resumeGame with adventureId: {}", adventureId);
        gameSaveService.resumeTimer(adventureId);
        log.info("Executed resumeGame for adventure {}", adventureId);
    }

    @Transactional(readOnly = true)
    public GameSaveDto buildGameSaveDto(GameSave save) {
        log.debug("Executing buildGameSaveDto with saveId: {}", save.getId());
        Long adventureId = save.getGraphicAdventure().getId();
        GameState state = save.getGameState();

        GameSaveDto dto = gameSaveMapper.toDto(save);

        if (dto.getGameState() != null && state != null) {
            SceneDto sceneDto = sceneService.getSceneByCode(adventureId, state.getCurrentSceneCode());
            dto.getGameState().setCurrentScene(sceneDto);
        }

        log.debug("Executed buildGameSaveDto: save {} built with currentScene: {}",
                dto.getCode(), state != null ? state.getCurrentSceneCode() : null);
        return dto;
    }
}
