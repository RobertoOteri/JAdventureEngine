package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GameSaveRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class GameSaveService {

    private final GameSaveRepository gameSaveRepository;
    private final GameSaveMapper gameSaveMapper;
    private final AuthService authService;

    public GameSaveService(GameSaveRepository gameSaveRepository,
                           GameSaveMapper gameSaveMapper,
                           AuthService authService) {
        this.gameSaveRepository = gameSaveRepository;
        this.gameSaveMapper = gameSaveMapper;
        this.authService = authService;
    }

    @Transactional
    public GameSave createInitialSave(User user,
                                      GraphicAdventureDto adventureDto,
                                      String currentSceneCode,
                                      Set<String> visibleItems) {
        GameSaveDto saveDto = GameSaveDto.builder()
                .name("Autosave - " + adventureDto.getTitle())
                .currentSceneCode(currentSceneCode)
                .build();

        GameSave sessionSave = gameSaveMapper.toEntity(saveDto, adventureDto);
        sessionSave.setUser(user);
        sessionSave.setVisibleItems(visibleItems != null ? new HashSet<>(visibleItems) : new HashSet<>());
        sessionSave.setInventory(new HashSet<>());
        sessionSave.setAdventureFlags(new HashMap<>());

        return gameSaveRepository.save(sessionSave);
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
    public GameSaveDto createSaveFromActive(String activeSaveCode, String saveName) {
        GameSave currentSave = findSaveByUser(activeSaveCode);

        String finalName = (saveName != null && !saveName.isBlank())
                ? saveName
                : "Salvataggio " + currentSave.getGraphicAdventure().getTitle();

        GameSave checkpoint = GameSave.builder()
                .name(finalName)
                .user(currentSave.getUser())
                .graphicAdventure(currentSave.getGraphicAdventure())
                .currentSceneCode(currentSave.getCurrentSceneCode())
                .inventory(new HashSet<>(currentSave.getInventory()))
                .adventureFlags(new HashMap<>(currentSave.getAdventureFlags()))
                .visibleItems(new HashSet<>(currentSave.getVisibleItems()))
                .build();

        return gameSaveMapper.toDto(gameSaveRepository.save(checkpoint));
    }

    @Transactional
    public GameSave save(GameSave save) {
        return gameSaveRepository.save(save);
    }

    @Transactional
    public void deleteSavesForAdventure(String username, String adventureCode) {
        gameSaveRepository.deleteAllByUserUsernameAndGraphicAdventureCode(username, adventureCode);
    }

    @Transactional(readOnly = true)
    public GameSave findLatestSave(String username, String adventureCode) {
        return gameSaveRepository
                .findFirstByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(username, adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Nessun salvataggio trovato per l'avventura: " + adventureCode));
    }

    @Transactional(readOnly = true)
    public GameSave findSaveByUser(String saveCode) {
        User user = authService.getCurrentUser();
        return gameSaveRepository.findByCodeAndUserUsername(saveCode, user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Salvataggio non trovato: " + saveCode));
    }
}