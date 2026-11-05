package com.jadventure.backend.model;

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
@Table(
        name = "dialogue_nodes",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_dialogue_nodes_item_code",
                columnNames = {"item_id", "code"}
        )
)
public class DialogueNode {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dialogue_node_seq_gen")
    @SequenceGenerator(
            name = "dialogue_node_seq_gen",
            sequenceName = "dialogue_node_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, updatable = false)
    private String code;

    @Column(length = 3000)
    private String text;

    @ManyToOne(optional = false)
    private Item item;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "source_node_id", nullable = false)
    @OrderBy("id")
    @Builder.Default
    private List<DialogueChoice> choices = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "node_id")
    @Builder.Default
    private List<GameEffect> effects = new ArrayList<>();

    @PrePersist
    void generateCode(){
        if(code == null){
            code = UUID.randomUUID().toString();
        }
    }
}
