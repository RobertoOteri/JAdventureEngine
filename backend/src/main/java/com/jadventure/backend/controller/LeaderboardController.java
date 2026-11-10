package com.jadventure.backend.controller;

import com.jadventure.backend.dto.leaderboard.LeaderboardEntryDto;
import com.jadventure.backend.service.LeaderboardService;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@Log4j2
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/{adventureId}")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @PathVariable("adventureId") Long adventureId) {
        log.info("Received GET request for the leaderboard of adventure {}", adventureId);
        List<LeaderboardEntryDto> leaderboard = leaderboardService.getLeaderboardForAdventure(adventureId);
        log.info("Returning leaderboard of adventure {} with {} entries", adventureId, leaderboard.size());
        return ResponseEntity.ok(leaderboard);
    }

}
