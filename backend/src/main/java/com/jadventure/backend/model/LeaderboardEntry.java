package com.jadventure.backend.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "leaderboard_entries",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "graphic_adventure_id"})
        }
)
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leaderboard_entry_seq_gen")
    @SequenceGenerator(
            name = "leaderboard_entry_seq_gen",
            sequenceName = "leaderboard_entry_seq",
            allocationSize = 1
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graphic_adventure_id", nullable = false)
    private GraphicAdventure graphicAdventure;

    @Column(name = "playtime_seconds", nullable = false)
    private Long playTimeSeconds;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onPrePersist() {
        if (this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }
}
