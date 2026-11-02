package com.jadventure.backend.model;

import com.jadventure.backend.model.enums.EffectType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "game_effects")
public class GameEffect {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "game_effect_seq_gen")
    @SequenceGenerator(
            name = "game_effect_seq_gen",
            sequenceName = "game_effect_seq",
            allocationSize = 1
    )
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EffectType type;

    private String targetValue;

    private String flagValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id")
    private Action action;
}
