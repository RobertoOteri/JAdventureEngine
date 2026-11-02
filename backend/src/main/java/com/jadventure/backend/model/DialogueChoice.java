package com.jadventure.backend.model;

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
@Table(name = "dialogue_choices")
public class DialogueChoice {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dialogue_choice_seq_gen")
    @SequenceGenerator(
            name = "dialogue_choice_seq_gen",
            sequenceName = "dialogue_choice_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(length = 1000)
    private String text;

    @ManyToOne
    private DialogueNode nextNode;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "choice_id")
    @Builder.Default
    private List<Precondition> preconditions = new ArrayList<>();


    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "choice_id")
    @Builder.Default
    private List<GameEffect> effects = new ArrayList<>();
}
