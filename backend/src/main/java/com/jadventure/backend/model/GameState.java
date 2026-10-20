package com.jadventure.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "game_states")
public class GameState {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "game_state_seq_gen")
    @SequenceGenerator(
            name = "game_state_seq_gen",
            sequenceName = "game_state_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(name = "current_scene_code", nullable = false)
    private String currentSceneCode;

    @ManyToMany(cascade = CascadeType.MERGE)
    @JoinTable(
            name = "game_state_inventory",
            joinColumns = @JoinColumn(name = "game_state_id"),
            inverseJoinColumns = @JoinColumn(name = "inventory_item_id")
    )
    @Builder.Default
    private List<InventoryItem> inventory = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "game_state_world_flags", joinColumns = @JoinColumn(name = "game_state_id"))
    @MapKeyColumn(name = "flag_key")
    @Column(name = "flag_value")
    @Builder.Default
    private Map<String, String> adventureFlags = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "game_state_scene_items", joinColumns = @JoinColumn(name = "game_state_id"))
    @Column(name = "item_code")
    @Builder.Default
    private Set<String> visibleItemCodes = new HashSet<>();

    @Column(name = "is_completed", nullable = false)
    private boolean completed = false;
}