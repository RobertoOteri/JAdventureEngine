package com.jadventure.backend.dto.leaderboard;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {

    private String username;
    private long playTime;
    private LocalDateTime completedAt;
}
