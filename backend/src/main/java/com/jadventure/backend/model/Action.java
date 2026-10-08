package com.jadventure.backend.model;

import com.jadventure.backend.model.enums.ActionType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "actions")
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "action_seq_gen")
    @SequenceGenerator(
            name = "action_seq_gen",
            sequenceName = "action_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, unique = true)
    @Builder.Default
    private String code = UUID.randomUUID().toString();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    private String successMessage;
    private String defaultFailureMessage;

    @OneToMany(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Precondition> preconditions = new ArrayList<>();

    @OneToMany(mappedBy = "action", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameEffect> effects = new ArrayList<>();

    @PrePersist
    protected void ensureCode() {
        if (this.code == null || this.code.isBlank()) {
            this.code = UUID.randomUUID().toString();
        }
    }
}
