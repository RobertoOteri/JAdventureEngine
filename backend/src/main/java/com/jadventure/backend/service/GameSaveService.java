package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.mapper.GameStateMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.GameState;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GameSaveRepository;
import com.jadventure.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class GameSaveService {

    private static final String AUTOSAVE_NAME = "Salvataggio automatico";
    private static final int MAX_SAVE_NAME_LENGTH = 255;

    private final GameSaveRepository gameSaveRepository;
    private final GraphicAdventureService graphicAdventureService;
    private final SceneService sceneService;
    private final ItemRepository itemRepository;
    private final GameSaveMapper gameSaveMapper;
    private final GameStateMapper gameStateMapper;
    private final AuthService authService;

    @Transactional
    public void createAutoSave(Long adventureId, String initialSceneCode, Set<String> visibleItemCodes) {
        log.info("Executing createAutoSave with adventureId: {}, initialSceneCode: {}", adventureId, initialSceneCode);
        User user = authService.getCurrentUser();
        GraphicAdventure adventure = graphicAdventureService.findReadableAdventure(adventureId);

        GameState state = GameState.builder()
                .currentSceneCode(initialSceneCode)
                .visibleItemCodes(new HashSet<>(visibleItemCodes))
                .lastActivityAt(LocalDateTime.now())
                .build();

        GameSave save = GameSave.builder()
                .name(AUTOSAVE_NAME)
                .user(user)
                .graphicAdventure(adventure)
                .autoSave(true)
                .gameState(state)
                .build();

        gameSaveRepository.save(save);
        log.info("Executed createAutoSave: autosave created for user {} on adventure {}", user.getUsername(), adventureId);
    }

    @Transactional
    public GameSaveDto createSave(Long adventureId, String saveName) {
        log.info("Executing createSave with adventureId: {}, saveName: {}", adventureId, saveName);
        if (!StringUtils.hasText(saveName) || saveName.length() > MAX_SAVE_NAME_LENGTH) {
            log.error("Cannot create save for adventure {}: invalid save name", adventureId);
            throw new InvalidOperationException("error.save.invalidName");
        }

        User user = authService.getCurrentUser();
        GameSave autoSave = findAutoSave(user.getUsername(), adventureId);
        GameState autoState = autoSave.getGameState();

        GameState copy = copyState(autoState);
        copy.setPlayTime(autoState.getPlayTime() + elapsedSeconds(autoState.getLastActivityAt()));

        GameSave save = GameSave.builder()
                .name(saveName)
                .user(user)
                .graphicAdventure(autoSave.getGraphicAdventure())
                .autoSave(false)
                .gameState(copy)
                .build();

        GameSaveDto created = gameSaveMapper.toDto(gameSaveRepository.save(save));
        log.info("Executed createSave: save {} created for user {} on adventure {}", created.getCode(), user.getUsername(), adventureId);
        return created;
    }

    @Transactional(readOnly = true)
    public GameStateDto loadActiveState(Long adventureId) {
        log.debug("Executing loadActiveState with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        GameState entity = findAutoSave(user.getUsername(), adventureId).getGameState();

        GameStateDto state = gameStateMapper.toDto(entity);
        state.setCurrentScene(sceneService.getSceneByCode(adventureId, entity.getCurrentSceneCode()));
        state.setPlayTime(entity.getPlayTime() + elapsedSeconds(entity.getLastActivityAt()));
        log.debug("Executed loadActiveState: user {} is in scene {} on adventure {}",
                user.getUsername(), entity.getCurrentSceneCode(), adventureId);
        return state;
    }

    @Transactional
    public GameSave resumeAutoSave(Long adventureId) {
        log.info("Executing resumeAutoSave with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        GameSave autoSave = findAutoSave(user.getUsername(), adventureId);
        autoSave.getGameState().setCurrentDialogueNodeCode(null);
        autoSave.getGameState().setLastActivityAt(LocalDateTime.now());
        log.info("Executed resumeAutoSave: autosave {} of user {} resumed", autoSave.getCode(), user.getUsername());
        return autoSave;
    }

    @Transactional
    public GameSave restoreSave(String saveCode) {
        log.info("Executing restoreSave with saveCode: {}", saveCode);
        GameSave save = findSaveByUser(saveCode);
        GameSave autoSave = findAutoSave(authService.getCurrentUsername(), save.getGraphicAdventure().getId());

        if (!save.isAutoSave()) {
            autoSave.setGameState(copyState(save.getGameState()));
        }
        autoSave.getGameState().setCurrentDialogueNodeCode(null);
        autoSave.getGameState().setLastActivityAt(LocalDateTime.now());

        GameSave restored = gameSaveRepository.save(autoSave);
        log.info("Executed restoreSave: save {} restored into autosave {}", saveCode, restored.getCode());
        return restored;
    }

    @Transactional
    public void pauseTimer(Long adventureId) {
        log.info("Executing pauseTimer with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        GameState state = findAutoSave(user.getUsername(), adventureId).getGameState();

        if (state.getLastActivityAt() != null) {
            state.setPlayTime(state.getPlayTime() + elapsedSeconds(state.getLastActivityAt()));
            state.setLastActivityAt(null);
        }
        log.info("Executed pauseTimer: timer of user {} on adventure {} paused at {} seconds",
                user.getUsername(), adventureId, state.getPlayTime());
    }

    @Transactional
    public void resumeTimer(Long adventureId) {
        log.info("Executing resumeTimer with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        GameState state = findAutoSave(user.getUsername(), adventureId).getGameState();

        if (state.getLastActivityAt() == null) {
            state.setLastActivityAt(LocalDateTime.now());
        }
        log.info("Executed resumeTimer: timer of user {} on adventure {} resumed", user.getUsername(), adventureId);
    }

    @Transactional
    public void updateAutoSave(Long adventureId, GameStateDto gameStateDto) {
        log.info("Executing updateAutoSave with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            log.error("Cannot update autosave for adventure {}: game state or current scene is missing", adventureId);
            throw new InvalidOperationException("error.game.stateMissing");
        }

        GameSave save = findAutoSave(user.getUsername(), adventureId);
        GameState gameState = save.getGameState();

        gameState.setCurrentSceneCode(gameStateDto.getCurrentScene().getCode());
        gameState.setCompleted(gameStateDto.isCompleted());
        gameState.setPlayTime(gameStateDto.getPlayTime());
        gameState.setCurrentDialogueNodeCode(gameStateDto.getCurrentDialogueNodeCode());
        gameState.setLastActivityAt(LocalDateTime.now());

        gameState.getAdventureFlags().clear();
        if (gameStateDto.getAdventureFlags() != null) {
            gameState.getAdventureFlags().putAll(gameStateDto.getAdventureFlags());
        }

        gameState.getVisibleItemCodes().clear();
        if (gameStateDto.getVisibleItemCodes() != null) {
            gameState.getVisibleItemCodes().addAll(gameStateDto.getVisibleItemCodes());
        }

        if (gameStateDto.getInventory() != null && !gameStateDto.getInventory().isEmpty()) {
            Set<String> codes = gameStateDto.getInventory().stream()
                    .map(ItemDto::getCode)
                    .collect(Collectors.toSet());

            List<Item> items = itemRepository.findAllByGraphicAdventureIdAndCodeIn(adventureId, codes);
            gameState.setInventory(items);
        } else {
            gameState.getInventory().clear();
        }

        save.setSavedAt(LocalDateTime.now());
        gameSaveRepository.save(save);
        log.info("Executed updateAutoSave: autosave of user {} on adventure {} updated (currentScene: {}, completed: {})",
                user.getUsername(), adventureId, gameStateDto.getCurrentScene().getCode(), gameStateDto.isCompleted());
    }

    @Transactional(readOnly = true)
    public List<GameSaveDto> getSavesForAdventure(Long adventureId) {
        log.info("Executing getSavesForAdventure with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();
        List<GameSave> saves = gameSaveRepository
                .findAllByUserUsernameAndGraphicAdventureIdOrderBySavedAtDesc(user.getUsername(), adventureId);
        List<GameSaveDto> saveDtos = gameSaveMapper.toDtoList(saves);
        log.info("Executed getSavesForAdventure: found {} saves for user {} on adventure {}", saveDtos.size(), user.getUsername(), adventureId);
        return saveDtos;
    }

    @Transactional(readOnly = true)
    public GameSaveDto getSaveByCode(String saveCode) {
        log.info("Executing getSaveByCode with saveCode: {}", saveCode);
        GameSaveDto save = gameSaveMapper.toDto(findSaveByUser(saveCode));
        log.info("Executed getSaveByCode: returning save {}", save.getCode());
        return save;
    }

    @Transactional
    public void deleteSavesForAdventure(String username, Long adventureId) {
        log.info("Executing deleteSavesForAdventure with username: {}, adventureId: {}", username, adventureId);
        gameSaveRepository.deleteAllByUserUsernameAndGraphicAdventureId(username, adventureId);
        gameSaveRepository.flush();
        log.info("Executed deleteSavesForAdventure: saves of user {} on adventure {} deleted", username, adventureId);
    }

    @Transactional(readOnly = true)
    public GameSave findSaveByUser(String saveCode) {
        log.info("Executing findSaveByUser with saveCode: {}", saveCode);
        User user = authService.getCurrentUser();
        GameSave save = gameSaveRepository.findByCodeAndUserUsername(saveCode, user.getUsername())
                .orElseThrow(() -> {
                    log.error("Save {} not found for user {}", saveCode, user.getUsername());
                    return new ResourceNotFoundException("error.save.notFound", saveCode);
                });
        log.info("Executed findSaveByUser: returning save {} of user {}", saveCode, user.getUsername());
        return save;
    }

    @Transactional(readOnly = true)
    public boolean hasPlayed(String username, String adventureCode) {
        log.debug("Executing hasPlayed with username: {}, adventureCode: {}", username, adventureCode);
        return gameSaveRepository.existsByUserUsernameAndGraphicAdventureCode(username, adventureCode);
    }

    private GameSave findAutoSave(String username, Long adventureId) {
        return gameSaveRepository.findFirstByUserUsernameAndGraphicAdventureIdAndAutoSaveTrue(username, adventureId)
                .orElseThrow(() -> {
                    log.error("Autosave not found for user {} on adventure {}", username, adventureId);
                    return new ResourceNotFoundException("error.save.noneForAdventure", adventureId);
                });
    }

    private GameState copyState(GameState source) {
        return GameState.builder()
                .currentSceneCode(source.getCurrentSceneCode())
                .inventory(new ArrayList<>(source.getInventory()))
                .adventureFlags(new HashMap<>(source.getAdventureFlags()))
                .visibleItemCodes(new HashSet<>(source.getVisibleItemCodes()))
                .playTime(source.getPlayTime())
                .completed(source.isCompleted())
                .currentDialogueNodeCode(source.getCurrentDialogueNodeCode())
                .build();
    }

    private long elapsedSeconds(LocalDateTime lastActivityAt) {
        if (lastActivityAt == null) {
            return 0;
        }
        return Math.max(0, Duration.between(lastActivityAt, LocalDateTime.now()).getSeconds());
    }
}
