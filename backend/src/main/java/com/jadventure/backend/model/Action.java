package com.jadventure.backend.model;

import com.jadventure.backend.model.enums.ActionType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "actions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_actions_item_code",
                columnNames = {"item_id", "code"}
        )
)
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "action_seq_gen")
    @SequenceGenerator(
            name = "action_seq_gen",
            sequenceName = "action_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "target_item_code", length = 50)
    private String targetItemCode;

    private String successMessage;
    private String defaultFailureMessage;

    @OneToMany(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Precondition> preconditions = new ArrayList<>();

    @OneToMany(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameEffect> effects = new ArrayList<>();
}