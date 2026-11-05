package com.jadventure.backend.controller;

import com.jadventure.backend.dto.leaderboard.LeaderboardEntryDto;
import com.jadventure.backend.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/{adventureId}")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @PathVariable("adventureId") Long adventureId) {
        List<LeaderboardEntryDto> leaderboard = leaderboardService.getLeaderboardForAdventure(adventureId);
        return ResponseEntity.ok(leaderboard);
    }

}
