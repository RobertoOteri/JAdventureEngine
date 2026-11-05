package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.item.ItemDto;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameSaveService {

    private final GameSaveRepository gameSaveRepository;
    private final GraphicAdventureService graphicAdventureService;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final ItemRepository itemRepository;
    private final GameSaveMapper gameSaveMapper;
    private final AuthService authService;

    @Transactional
    public GameSaveDto createSave(Long adventureId, String saveName, GameStateDto gameStateDto) {
        User user = authService.getCurrentUser();

        graphicAdventureService.getAdventureById(adventureId);
        GraphicAdventure adventure = graphicAdventureRepository.findById(adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata con ID: " + adventureId));

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco mancante");
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

        return gameSaveMapper.toDto(gameSaveRepository.save(save));
    }

    @Transactional
    public void updateAutoSave(Long adventureId, GameStateDto gameStateDto) {
        User user = authService.getCurrentUser();

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco mancante");
        }

        GameSave save = gameSaveRepository
                .findFirstByUserUsernameAndGraphicAdventureIdAndAutoSaveTrue(user.getUsername(), adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Autosave non trovato per questa avventura"));

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
    }

    @Transactional(readOnly = true)
    public List<GameSaveDto> getSavesForAdventure(Long adventureId) {
        User user = authService.getCurrentUser();
        List<GameSave> saves = gameSaveRepository
                .findAllByUserUsernameAndGraphicAdventureIdOrderBySavedAtDesc(user.getUsername(), adventureId);
        return gameSaveMapper.toDtoList(saves);
    }

    @Transactional(readOnly = true)
    public GameSaveDto getSaveByCode(String saveCode) {
        return gameSaveMapper.toDto(findSaveByUser(saveCode));
    }

    @Transactional
    public void deleteSavesForAdventure(String username, Long adventureId) {
        gameSaveRepository.deleteAllByUserUsernameAndGraphicAdventureId(username, adventureId);
    }

    @Transactional(readOnly = true)
    public GameSave findLatestSave(String username, Long adventureId) {
        return gameSaveRepository.findFirstByUserUsernameAndGraphicAdventureIdOrderBySavedAtDesc(username, adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Nessun salvataggio trovato per l'avventura: " + adventureId));
    }

    @Transactional(readOnly = true)
    public GameSave findSaveByUser(String saveCode) {
        User user = authService.getCurrentUser();
        return gameSaveRepository.findByCodeAndUserUsername(saveCode, user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Salvataggio non trovato: " + saveCode));
    }
}