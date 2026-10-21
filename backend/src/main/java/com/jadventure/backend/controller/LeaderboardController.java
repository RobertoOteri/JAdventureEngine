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

    @GetMapping("/{adventureCode}")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @PathVariable("adventureCode") String adventureCode) {
        List<LeaderboardEntryDto> leaderboard = leaderboardService.getLeaderboardForAdventure(adventureCode);
        return ResponseEntity.ok(leaderboard);
    }

}
