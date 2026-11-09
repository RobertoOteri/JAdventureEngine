package com.jadventure.backend.service;

import com.jadventure.backend.dto.leaderboard.LeaderboardEntryDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.LeaderboardEntryMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.LeaderboardEntry;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.LeaderboardEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final LeaderboardEntryMapper leaderboardEntryMapper;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboardForAdventure(Long adventureId) {
        if (!graphicAdventureRepository.existsById(adventureId)) {
            throw new ResourceNotFoundException("error.adventure.notFoundById", adventureId);
        }

        List<LeaderboardEntry> entries = leaderboardEntryRepository
                .findTop15ByGraphicAdventureIdOrderByPlayTimeAscCompletedAtAsc(adventureId);

        return leaderboardEntryMapper.toDtoList(entries);
    }

    @Transactional
    public void createLeaderboardEntry(Long adventureId, long playTime) {
        User currentUser = authService.getCurrentUser();

        boolean alreadyCompleted = leaderboardEntryRepository
                .existsByUserUsernameAndGraphicAdventureId(currentUser.getUsername(), adventureId);

        if (alreadyCompleted) {
            return;
        }

        GraphicAdventure adventure = graphicAdventureRepository.findById(adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("error.adventure.notFoundById", adventureId));

        LeaderboardEntry newEntry = LeaderboardEntry.builder()
                .user(currentUser)
                .graphicAdventure(adventure)
                .playTime(playTime)
                .completedAt(LocalDateTime.now())
                .build();

        leaderboardEntryRepository.save(newEntry);
    }

}
