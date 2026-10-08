package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameActionDto;
import com.jadventure.backend.dto.game.GameActionResultDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.mapper.InventoryItemMapper;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.*;
import com.jadventure.backend.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class GamePlayService {

    private final GameSaveRepository gameSaveRepository;
    private final GraphicAdventureRepository adventureRepository;
    private final UserRepository userRepository;
    private final SceneRepository sceneRepository;
    private final ActionRepository actionRepository;
    private final InventoryItemRepository inventoryItemRepository;

    private final PreconditionService preconditionService;
    private final GameEffectService gameEffectService;

    private final GameSaveMapper gameSaveMapper;
    private final SceneMapper sceneMapper;
    private final InventoryItemMapper inventoryItemMapper;

    public GamePlayService(GameSaveRepository gameSaveRepository,
                           GraphicAdventureRepository adventureRepository,
                           UserRepository userRepository,
                           SceneRepository sceneRepository,
                           ActionRepository actionRepository,
                           InventoryItemRepository inventoryItemRepository,
                           PreconditionService preconditionService,
                           GameEffectService gameEffectService,
                           GameSaveMapper gameSaveMapper,
                           SceneMapper sceneMapper,
                           InventoryItemMapper inventoryItemMapper) {
        this.gameSaveRepository = gameSaveRepository;
        this.adventureRepository = adventureRepository;
        this.userRepository = userRepository;
        this.sceneRepository = sceneRepository;
        this.actionRepository = actionRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.preconditionService = preconditionService;
        this.gameEffectService = gameEffectService;
        this.gameSaveMapper = gameSaveMapper;
        this.sceneMapper = sceneMapper;
        this.inventoryItemMapper = inventoryItemMapper;
    }

    @Transactional
    public GameStateDto startNewGame(String adventureCode) {
        User user = getValidatedAuthenticatedUser();
        GraphicAdventure adventure = findAdventure(adventureCode);

        gameSaveRepository.deleteAllByUserUsernameAndGraphicAdventureCode(user.getUsername(), adventureCode);

        String startingSceneCode = adventure.getInitialSceneCode();
        Scene startingScene = sceneRepository.findByGraphicAdventureCodeAndCode(adventureCode, startingSceneCode)
                .orElseThrow(() -> new ResourceNotFoundException("Scena iniziale non trovata: " + startingSceneCode));

        Set<String> initialVisibleItems = startingScene.getItems().stream()
                .filter(Item::isInitiallyVisible)
                .map(Item::getCode)
                .collect(Collectors.toSet());

        GameSave sessionSave = GameSave.builder()
                .name("Sessione iniziale - " + adventure.getTitle())
                .user(user)
                .graphicAdventure(adventure)
                .currentSceneCode(startingScene.getCode())
                .visibleSceneItems(initialVisibleItems)
                .build();

        GameSave saved = gameSaveRepository.save(sessionSave);
        return buildGameState(saved);
    }

    @Transactional(readOnly = true)
    public GameStateDto continueGame(String adventureCode) {
        User user = getValidatedAuthenticatedUser();

        GameSave lastSave = gameSaveRepository
                .findFirstByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(user.getUsername(), adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Nessun salvataggio trovato per riprendere la partita"));

        return buildGameState(lastSave);
    }

    @Transactional(readOnly = true)
    public GameStateDto loadGame(String saveCode) {
        GameSave save = findSaveByUser(saveCode);
        return buildGameState(save);
    }

    @Transactional(readOnly = true)
    public List<GameSaveDto> getSavesForAdventure(String adventureCode) {
        User user = getValidatedAuthenticatedUser();
        List<GameSave> saves = gameSaveRepository
                .findAllByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(user.getUsername(), adventureCode);
        return gameSaveMapper.toDtoList(saves);
    }


    @Transactional
    public GameActionResultDto executeAction(String saveCode, GameActionDto actionDto) {
        GameSave save = findSaveByUser(saveCode);

        Action action = actionRepository.findByItemCodeAndType(actionDto.getItemCode(), actionDto.getActionType())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Azione '" + actionDto.getActionType() + "' non trovata per l'item: " + actionDto.getItemCode()
                ));

        Optional<String> failureMessage = preconditionService.validatePreconditions(save, action);

        if(failureMessage.isPresent()) {
            return GameActionResultDto.builder()
                    .success(false)
                    .feedbackMessage(failureMessage.get())
                    .state(buildGameState(save))
                    .build();
        }

        gameEffectService.applyAll(save, action.getEffects());
        gameSaveRepository.save(save);

        String successMessage = action.getSuccessMessage() != null
                ? action.getSuccessMessage()
                : "Azione eseguita con successo.";

        return GameActionResultDto.builder()
                .success(true)
                .feedbackMessage(successMessage)
                .state(buildGameState(save))
                .build();

    }

    @Transactional
    public GameSaveDto createSave(String activeSaveCode, String saveName) {
        GameSave sourceSave = findSaveByUser(activeSaveCode);

        String finalName = (saveName != null && !saveName.isBlank())
                ? saveName
                : "Salvataggio " + sourceSave.getGraphicAdventure().getTitle();

        GameSave newSave = GameSave.builder()
                .name(finalName)
                .user(sourceSave.getUser())
                .graphicAdventure(sourceSave.getGraphicAdventure())
                .currentSceneCode(sourceSave.getCurrentSceneCode())
                .inventory(new HashSet<>(sourceSave.getInventory()))
                .worldFlags(new HashMap<>(sourceSave.getWorldFlags()))
                .visibleSceneItems(new HashSet<>(sourceSave.getVisibleSceneItems()))
                .build();

        GameSave persisted = gameSaveRepository.save(newSave);
        return gameSaveMapper.toDto(persisted);
    }

    private GameStateDto buildGameState(GameSave save) {
        Scene currentScene = sceneRepository.findByGraphicAdventureCodeAndCode(
                        save.getGraphicAdventure().getCode(), save.getCurrentSceneCode())
                .orElseThrow(() -> new ResourceNotFoundException("Scena non trovata: " + save.getCurrentSceneCode()));

        SceneDto sceneDto = sceneMapper.toDto(currentScene);

        List<InventoryItemDto> inventoryDtos = save.getInventory().isEmpty()
                ? List.of()
                : inventoryItemRepository.findAllByCodeIn(save.getInventory())
                .stream()
                .map(inventoryItemMapper::toDto)
                .collect(Collectors.toList());

        return GameStateDto.builder()
                .saveCode(save.getCode())
                .currentScene(sceneDto)
                .inventory(inventoryDtos)
                .worldFlags(save.getWorldFlags())
                .visibleSceneItemCodes(save.getVisibleSceneItems())
                .build();
    }

    private GameSave findSaveByUser(String saveCode) {
        User user = getValidatedAuthenticatedUser();
        return gameSaveRepository.findByCodeAndUserUsername(saveCode, user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Salvataggio non trovato: " + saveCode));
    }

    private GraphicAdventure findAdventure(String code) {
        return adventureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata: " + code));
    }

    private User getValidatedAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("Operazione non consentita: utente non autenticato");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utente autenticato non trovato: " + username));
    }
}