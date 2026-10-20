package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GameSaveMapper;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GameSaveRepository;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GameSaveService {

    private final GameSaveRepository gameSaveRepository;
    private final GraphicAdventureService graphicAdventureService;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final GameSaveMapper gameSaveMapper;
    private final AuthService authService;

    public GameSaveService(
            GameSaveRepository gameSaveRepository,
            GraphicAdventureService graphicAdventureService,
            GraphicAdventureRepository graphicAdventureRepository,
            GameSaveMapper gameSaveMapper,
            AuthService authService
    ) {
        this.gameSaveRepository = gameSaveRepository;
        this.graphicAdventureService = graphicAdventureService;
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.gameSaveMapper = gameSaveMapper;
        this.authService = authService;
    }

    @Transactional
    public GameSaveDto createSave(String adventureCode, String saveName, GameStateDto gameStateDto) {
        User user = authService.getCurrentUser();
        GraphicAdventureDto adventureDto = graphicAdventureService.getAdventureByCode(adventureCode);
        GraphicAdventure adventure = graphicAdventureRepository.findById(adventureDto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata: " + adventureCode));

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
    public void updateAutoSave(String adventureCode, GameStateDto gameStateDto) {
        User user = authService.getCurrentUser();

        if (gameStateDto == null || gameStateDto.getCurrentScene() == null) {
            throw new IllegalArgumentException("Stato di gioco mancante");
        }

        GameSave save = gameSaveRepository
                .findFirstByUserUsernameAndGraphicAdventureCodeAndAutoSaveTrue(user.getUsername(), adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Autosave non trovato per questa avventura"));

        save.setName("Salvataggio automatico");

        GameSaveDto tempDto = GameSaveDto.builder().gameState(gameStateDto).build();
        GameSave mappedTemp = gameSaveMapper.toEntity(tempDto);

        if (save.getGameState() != null && mappedTemp.getGameState() != null) {
            mappedTemp.getGameState().setId(save.getGameState().getId());
        }

        save.setGameState(mappedTemp.getGameState());
        save.setSavedAt(LocalDateTime.now());

        gameSaveRepository.save(save);
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