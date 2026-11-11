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
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class LeaderboardService {

    private final LeaderboardEntryRepository leaderboardEntryRepository;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final LeaderboardEntryMapper leaderboardEntryMapper;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboardForAdventure(Long adventureId) {
        log.info("Executing getLeaderboardForAdventure with adventureId: {}", adventureId);
        if (!graphicAdventureRepository.existsById(adventureId)) {
            log.error("Adventure with id {} not found", adventureId);
            throw new ResourceNotFoundException("error.adventure.notFoundById", adventureId);
        }

        List<LeaderboardEntry> entries = leaderboardEntryRepository
                .findTop15ByGraphicAdventureIdOrderByPlayTimeAscCompletedAtAsc(adventureId);

        List<LeaderboardEntryDto> leaderboard = leaderboardEntryMapper.toDtoList(entries);
        log.info("Executed getLeaderboardForAdventure: found {} entries for adventure {}", leaderboard.size(), adventureId);
        return leaderboard;
    }

    @Transactional
    public void createLeaderboardEntry(Long adventureId, long playTime) {
        log.info("Executing createLeaderboardEntry with adventureId: {}, playTime: {}", adventureId, playTime);
        User currentUser = authService.getCurrentUser();

        boolean alreadyCompleted = leaderboardEntryRepository
                .existsByUserUsernameAndGraphicAdventureId(currentUser.getUsername(), adventureId);

        if (alreadyCompleted) {
            log.info("Executed createLeaderboardEntry: user {} already has an entry for adventure {}, nothing to do",
                    currentUser.getUsername(), adventureId);
            return;
        }

        GraphicAdventure adventure = graphicAdventureRepository.findById(adventureId)
                .orElseThrow(() -> {
                    log.error("Adventure with id {} not found", adventureId);
                    return new ResourceNotFoundException("error.adventure.notFoundById", adventureId);
                });

        LeaderboardEntry newEntry = LeaderboardEntry.builder()
                .user(currentUser)
                .graphicAdventure(adventure)
                .playTime(playTime)
                .completedAt(LocalDateTime.now())
                .build();

        leaderboardEntryRepository.save(newEntry);
        log.info("Executed createLeaderboardEntry: entry created for user {} on adventure {} with playTime {}",
                currentUser.getUsername(), adventureId, playTime);
    }

    @Transactional(readOnly = true)
    public boolean hasCompleted(String username, String adventureCode) {
        log.debug("Executing hasCompleted with username: {}, adventureCode: {}", username, adventureCode);
        return leaderboardEntryRepository.existsByUserUsernameAndGraphicAdventureCode(username, adventureCode);
    }

    @Transactional(readOnly = true)
    public Set<String> findUsernamesWhoCompleted(String adventureCode, Collection<String> usernames) {
        log.debug("Executing findUsernamesWhoCompleted with adventureCode: {}, {} usernames", adventureCode, usernames.size());
        if (usernames.isEmpty()) {
            return Set.of();
        }
        return leaderboardEntryRepository.findAllByGraphicAdventureCodeAndUserUsernameIn(adventureCode, usernames)
                .stream()
                .map(entry -> entry.getUser().getUsername())
                .collect(Collectors.toSet());
    }

}
