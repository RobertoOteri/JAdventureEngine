package com.jadventure.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
        name = "items",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"graphic_adventure_id", "code"})
        }
)
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "items_seq_gen")
    @SequenceGenerator(
            name = "items_seq_gen",
            sequenceName = "items_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Embedded
    private Hotspot hotspot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graphic_adventure_id", nullable = false, updatable = false)
    private GraphicAdventure graphicAdventure;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Action> actions = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    @Builder.Default
    private List<DialogueNode> dialogueNodes = new ArrayList<>();

}
