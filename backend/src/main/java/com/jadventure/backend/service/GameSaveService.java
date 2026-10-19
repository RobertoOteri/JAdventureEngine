package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GameSaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameSaveService {

    private final GameSaveRepository gameSaveRepository;
    private final GraphicAdventureService graphicAdventureService;
    private final GameSaveMapper gameSaveMapper;
    private final AuthService authService;

    public GameSaveService(
            GameSaveRepository gameSaveRepository,
            GraphicAdventureService graphicAdventureService,
            GameSaveMapper gameSaveMapper,
            AuthService authService
    ) {
        this.gameSaveRepository = gameSaveRepository;
        this.graphicAdventureService = graphicAdventureService;
        this.gameSaveMapper = gameSaveMapper;
        this.authService = authService;
    }

    @Transactional
    public GameSaveDto createSave(String adventureCode, String saveName, GameStateDto gameStateDto) {
        User user = authService.getCurrentUser();
        GraphicAdventureDto adventure = graphicAdventureService.getAdventureByCode(adventureCode);

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco mancante");
        }

        GameSave save = gameSaveMapper.toEntity(GameSaveDto.builder()
                .name(saveName)
                .currentSceneCode(gameStateDto.getCurrentScene().getCode())
                .build(), adventure);

        save.setUser(user);
        save.setAutoSave(false);

        populateSaveData(save, gameStateDto);
        return gameSaveMapper.toDto(gameSaveRepository.save(save));
    }

    @Transactional
    public void updateAutoSave(String adventureCode, GameStateDto gameStateDto) {
        User user = authService.getCurrentUser();

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco mancante");
        }

        GameSave save = gameSaveRepository
                .findFirstByUserUsernameAndGraphicAdventureCodeAndAutoSaveTrue(user.getUsername(), adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Autosave non trovato per questa avventura"));

        save.setName("Salvataggio automatico");
        populateSaveData(save, gameStateDto);
        gameSaveRepository.save(save);
    }

    private void populateSaveData(GameSave save, GameStateDto gameStateDto) {
        save.setCurrentSceneCode(gameStateDto.getCurrentScene().getCode());
        save.setVisibleItems(gameStateDto.getVisibleItemCodes() == null ? new HashSet<>() : new HashSet<>(gameStateDto.getVisibleItemCodes()));
        save.setInventory(gameStateDto.getInventory() == null ? new HashSet<>() : gameStateDto.getInventory().stream().map(InventoryItemDto::getCode).collect(Collectors.toSet()));
        save.setAdventureFlags(gameStateDto.getAdventureFlags() == null ? new HashMap<>() : new HashMap<>(gameStateDto.getAdventureFlags()));
        save.setSavedAt(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<GameSaveDto> getSavesForAdventure(String adventureCode) {
        User user = authService.getCurrentUser();
        List<GameSave> saves = gameSaveRepository
                .findAllByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(user.getUsername(), adventureCode);
        return gameSaveMapper.toDtoList(saves);
    }

    @Transactional(readOnly = true)
    public GameSaveDto getSaveByCode(String saveCode) {
        return gameSaveMapper.toDto(findSaveByUser(saveCode));
    }

    @Transactional
    public void deleteSavesForAdventure(String username, String adventureCode) {
        gameSaveRepository.deleteAllByUserUsernameAndGraphicAdventureCode(username, adventureCode);
    }

    @Transactional(readOnly = true)
    public GameSave findLatestSave(String username, String adventureCode) {
        return gameSaveRepository.findFirstByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(username, adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Nessun salvataggio trovato per l'avventura: " + adventureCode));
    }

    @Transactional(readOnly = true)
    public GameSave findSaveByUser(String saveCode) {
        User user = authService.getCurrentUser();
        return gameSaveRepository.findByCodeAndUserUsername(saveCode, user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Salvataggio non trovato: " + saveCode));
    }
}