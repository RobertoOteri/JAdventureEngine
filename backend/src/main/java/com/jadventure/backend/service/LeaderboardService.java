package com.jadventure.backend.service;

import com.jadventure.backend.dto.leaderboard.LeaderboardEntryDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.LeaderboardEntryMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.LeaderboardEntry;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.LeaderboardEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final LeaderboardEntryMapper leaderboardEntryMapper;
    private final AuthService authService;

    public LeaderboardService(LeaderboardEntryRepository leaderboardEntryRepository,
                              GraphicAdventureRepository graphicAdventureRepository,
                              LeaderboardEntryMapper leaderboardEntryMapper,
                              AuthService authService) {
        this.leaderboardEntryRepository = leaderboardEntryRepository;
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.leaderboardEntryMapper = leaderboardEntryMapper;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboardForAdventure(String adventureCode) {
        if (!graphicAdventureRepository.existsByCode(adventureCode)) {
            throw new ResourceNotFoundException("Avventura non trovata con codice: " + adventureCode);
        }

        List<LeaderboardEntry> entries = leaderboardEntryRepository
                .findTop15ByGraphicAdventureCodeOrderByPlayTimeSecondsAscCompletedAtAsc(adventureCode);

        return leaderboardEntryMapper.toDtoList(entries);
    }

    @Transactional
    public void createLeaderboardEntry(String adventureCode, long playTimeSeconds) {
        User currentUser = authService.getCurrentUser();

        boolean alreadyCompleted = leaderboardEntryRepository
                .existsByUserUsernameAndGraphicAdventureCode(currentUser.getUsername(), adventureCode);

        if (alreadyCompleted) {
            return;
        }

        GraphicAdventure adventure = graphicAdventureRepository.findByCode(adventureCode)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata con codice: " + adventureCode));

        LeaderboardEntry newEntry = LeaderboardEntry.builder()
                .user(currentUser)
                .graphicAdventure(adventure)
                .playTimeSeconds(playTimeSeconds)
                .completedAt(LocalDateTime.now())
                .build();

        leaderboardEntryRepository.save(newEntry);
    }

}
