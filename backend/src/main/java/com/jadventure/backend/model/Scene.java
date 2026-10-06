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
        name = "scenes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"graphic_adventure_id", "code"})
        }
)
public class Scene {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "scenes_seq_gen")
    @SequenceGenerator(
            name = "scenes_seq_gen",
            sequenceName = "scenes_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "background_image_url", nullable = false, length = 255)
    private String backgroundImageUrl;

    @OneToMany(mappedBy = "scene", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Item> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graphic_adventure_id")
    private GraphicAdventure graphicAdventure;



}
