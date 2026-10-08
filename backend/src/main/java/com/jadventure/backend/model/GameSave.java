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

    @Builder.Default
    @Column(nullable = false, unique = true)
    private String code = UUID.randomUUID().toString();

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "current_scene_code", nullable = false)
    private String currentSceneCode;

    @ElementCollection
    @CollectionTable(name = "game_save_inventory", joinColumns = @JoinColumn(name = "game_save_id"))
    @Column(name = "item_code")
    @Builder.Default
    private Set<String> inventory = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "game_save_world_flags", joinColumns = @JoinColumn(name = "game_save_id"))
    @MapKeyColumn(name = "flag_key")
    @Column(name = "flag_value")
    @Builder.Default
    private Map<String, String> worldFlags = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "game_save_scene_items", joinColumns = @JoinColumn(name = "game_save_id"))
    @Column(name = "item_code")
    @Builder.Default
    private Set<String> visibleSceneItems = new HashSet<>();

    @Column(name = "saved_at")
    private LocalDateTime savedAt;

    @ManyToOne
    @JoinColumn(name = "graphic_adventure_id", nullable = false)
    private GraphicAdventure graphicAdventure;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.savedAt = LocalDateTime.now();
    }

}
