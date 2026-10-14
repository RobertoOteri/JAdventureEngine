package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GamePlayService {

    private final GraphicAdventureService graphicAdventureService;
    private final GameSaveService gameSaveService;
    private final AuthService authService;
    private final SceneService sceneService;
    private final InventoryItemService inventoryItemService;

    public GamePlayService(GraphicAdventureService graphicAdventureService,
                           GameSaveService gameSaveService,
                           AuthService authService,
                           SceneService sceneService,
                           InventoryItemService inventoryItemService) {
        this.graphicAdventureService = graphicAdventureService;
        this.gameSaveService = gameSaveService;
        this.authService = authService;
        this.sceneService = sceneService;
        this.inventoryItemService = inventoryItemService;
    }

    @Transactional
    public GameStateDto startNewGame(String adventureCode) {
        User user = authService.getCurrentUser();
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);

        gameSaveService.deleteSavesForAdventure(user.getUsername(), adventureCode);

        String startingSceneCode = adventureDto.getInitialSceneCode();
        if (startingSceneCode == null || startingSceneCode.isBlank()) {
            throw new ResourceNotFoundException("L'avventura non ha una scena iniziale configurata");
        }

        SceneDto startingSceneDto = sceneService.getSceneByCode(adventureCode, startingSceneCode);

        Set<String> initialVisibleItems = startingSceneDto.getItems() == null
                ? Collections.emptySet()
                : startingSceneDto.getItems().stream()
                .filter(ItemDto::isInitiallyVisible)
                .map(ItemDto::getCode)
                .collect(Collectors.toSet());

        GameSave initialSave = gameSaveService.createInitialSave(
                user,
                adventureDto,
                startingSceneDto.getCode(),
                initialVisibleItems
        );

        return buildGameState(initialSave);
    }

    @Transactional(readOnly = true)
    public GameStateDto continueGame(String adventureCode) {
        User user = authService.getCurrentUser();
        GameSave lastSave = gameSaveService.findLatestSave(user.getUsername(), adventureCode);
        return buildGameState(lastSave);
    }

    @Transactional(readOnly = true)
    public GameStateDto loadGame(String saveCode) {
        GameSave save = gameSaveService.findSaveByUser(saveCode);
        return buildGameState(save);
    }

    @Transactional(readOnly = true)
    public GameStateDto buildGameState(GameSave save) {
        String advCode = save.getGraphicAdventure().getCode();

        SceneDto sceneDto = sceneService.getSceneByCode(
                advCode,
                save.getCurrentSceneCode()
        );

        List<InventoryItemDto> inventoryDtos = inventoryItemService.getInventoryItemsByAdventureAndCodes(
                advCode,
                save.getInventory()
        );

        return GameStateDto.builder()
                .saveCode(save.getCode())
                .currentScene(sceneDto)
                .inventory(inventoryDtos)
                .adventureFlags(save.getAdventureFlags())
                .visibleItemCodes(save.getVisibleItems())
                .build();
    }
}