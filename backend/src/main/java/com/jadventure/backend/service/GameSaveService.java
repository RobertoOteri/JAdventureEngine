package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GameSaveRepository;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class GameSaveService {

    private final GameSaveRepository gameSaveRepository;
    private final GraphicAdventureService graphicAdventureService;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final ItemRepository itemRepository;
    private final GameSaveMapper gameSaveMapper;
    private final AuthService authService;

    @Transactional
    public GameSaveDto createSave(Long adventureId, String saveName, GameStateDto gameStateDto) {
        log.info("Executing createSave with adventureId: {}, saveName: {}", adventureId, saveName);
        User user = authService.getCurrentUser();

        graphicAdventureService.getAdventureById(adventureId);
        GraphicAdventure adventure = graphicAdventureRepository.findById(adventureId)
                .orElseThrow(() -> {
                    log.error("Adventure with id {} not found", adventureId);
                    return new ResourceNotFoundException("error.adventure.notFoundById", adventureId);
                });

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            log.error("Cannot create save for adventure {}: game state or current scene is missing", adventureId);
            throw new InvalidOperationException("error.game.stateMissing");
        }

        GameSaveDto saveDto = GameSaveDto.builder()
                .name(saveName)
                .gameState(gameStateDto)
                .build();

        GameSave save = gameSaveMapper.toEntity(saveDto);
        save.setUser(user);
        save.setGraphicAdventure(adventure);
        save.setAutoSave(false);
        save.setSavedAt(LocalDateTime.now());

        GameSaveDto created = gameSaveMapper.toDto(gameSaveRepository.save(save));
        log.info("Executed createSave: save {} created for user {} on adventure {}", created.getCode(), user.getUsername(), adventureId);
        return created;
    }

    @Transactional
    public void updateAutoSave(Long adventureId, GameStateDto gameStateDto) {
        log.info("Executing updateAutoSave with adventureId: {}", adventureId);
        User user = authService.getCurrentUser();

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            log.error("Cannot update autosave for adventure {}: game state or current scene is missing", adventureId);
            throw new InvalidOperationException("error.game.stateMissing");
        }

        GameSave save = gameSaveRepository
                .findFirstByUserUsernameAndGraphicAdventureIdAndAutoSaveTrue(user.getUsername(), adventureId)
                .orElseThrow(() -> {
                    log.error("Autosave not found for user {} on adventure {}", user.getUsername(), adventureId);
                    return new ResourceNotFoundException("error.save.autosaveNotFound");
                });

        save.setName("Salvataggio automatico");

        if (save.getGameState() != null) {
            save.getGameState().setCurrentSceneCode(gameStateDto.getCurrentScene().getCode());
            save.getGameState().setCompleted(gameStateDto.isCompleted());
            save.getGameState().setPlayTime(gameStateDto.getPlayTime());

            if (gameStateDto.getAdventureFlags() != null) {
                save.getGameState().getAdventureFlags().clear();
                save.getGameState().getAdventureFlags().putAll(gameStateDto.getAdventureFlags());
            }

            if (gameStateDto.getVisibleItemCodes() != null) {
                save.getGameState().getVisibleItemCodes().clear();
                save.getGameState().getVisibleItemCodes().addAll(gameStateDto.getVisibleItemCodes());
            }

            if (gameStateDto.getInventory() != null && !gameStateDto.getInventory().isEmpty()) {
                Set<String> codes = gameStateDto.getInventory().stream()
                        .map(ItemDto::getCode)
                        .collect(Collectors.toSet());

                List<Item> items = itemRepository
                        .findAllByGraphicAdventureIdAndCodeIn(adventureId, codes);

                save.getGameState().setInventory(items);
            } else {
                save.getGameState().getInventory().clear();
            }
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
        log.info("Executed deleteSavesForAdventure: saves of user {} on adventure {} deleted", username, adventureId);
    }

    @Transactional(readOnly = true)
    public GameSave findLatestSave(String username, Long adventureId) {
        log.info("Executing findLatestSave with username: {}, adventureId: {}", username, adventureId);
        GameSave save = gameSaveRepository.findFirstByUserUsernameAndGraphicAdventureIdOrderBySavedAtDesc(username, adventureId)
                .orElseThrow(() -> {
                    log.error("No save found for user {} on adventure {}", username, adventureId);
                    return new ResourceNotFoundException("error.save.noneForAdventure", adventureId);
                });
        log.info("Executed findLatestSave: returning save {} saved at {}", save.getId(), save.getSavedAt());
        return save;
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
}
