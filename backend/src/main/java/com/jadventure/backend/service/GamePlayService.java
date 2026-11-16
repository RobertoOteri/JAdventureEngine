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

        SceneDto initialScene = sceneService.getSceneByCode(adventureId, initialSceneCode);

        Set<String> visibleItems = sceneService.getScenesByAdventure(adventureId).stream()
                .filter(scene -> scene.getItems() != null)
                .flatMap(scene -> scene.getItems().stream())
                .filter(item -> item.getHotspot() != null && Boolean.TRUE.equals(item.getHotspot().getInitiallyVisible()))
                .map(ItemDto::getCode)
                .collect(Collectors.toSet());

        GameStateDto initialState = GameStateDto.builder()
                .currentScene(initialScene)
                .visibleItemCodes(visibleItems)
                .build();

        GameSaveDto saveDto = gameSaveService.createSave(adventureId, "Salvataggio automatico", initialState);

        GameSave saveEntity = gameSaveService.findSaveByUser(saveDto.getCode());
        saveEntity.setAutoSave(true);

        GameSaveDto newGame = loadGame(saveDto.getCode());
        log.info("Executed startNewGame: user {} started adventure {} from scene {} with save {}",
                user.getUsername(), adventureId, initialSceneCode, newGame.getCode());
        return newGame;
    }

    @Transactional(readOnly = true)
    public GameSaveDto continueGame(Long adventureId) {
        log.info("Executing continueGame with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        GameSave lastSave = gameSaveService.findLatestSave(user.getUsername(), adventureId);
        GameSaveDto save = buildGameSaveDto(lastSave);
        log.info("Executed continueGame: user {} resumed adventure {} from save {}", user.getUsername(), adventureId, save.getCode());
        return save;
    }

    @Transactional(readOnly = true)
    public GameSaveDto loadGame(String saveCode) {
        log.info("Executing loadGame with saveCode: {}", saveCode);
        GameSave save = gameSaveService.findSaveByUser(saveCode);
        GameSaveDto saveDto = buildGameSaveDto(save);
        log.info("Executed loadGame: returning save {} of adventure {}", saveDto.getCode(), save.getGraphicAdventure().getId());
        return saveDto;
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
