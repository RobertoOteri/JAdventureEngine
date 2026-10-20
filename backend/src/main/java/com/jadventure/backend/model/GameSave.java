package com.jadventure.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "game_saves")
public class GameSave {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "game_save_seq_gen")
    @SequenceGenerator(
            name = "game_save_seq_gen",
            sequenceName = "game_save_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "saved_at")
    private LocalDateTime savedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graphic_adventure_id", nullable = false)
    private GraphicAdventure graphicAdventure;

    @Column(name = "is_auto_save", nullable = false)
    private boolean autoSave = false;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "game_state_id", nullable = false)
    private GameState gameState;

    @PrePersist
    protected void onPrePersist() {
        this.savedAt = LocalDateTime.now();
        if (this.code == null || this.code.isBlank()) {
            this.code = "save_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        }
    }

    @PreUpdate
    protected void onPreUpdate() {
        this.savedAt = LocalDateTime.now();
    }
}