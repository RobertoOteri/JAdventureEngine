package com.jadventure.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "graphic_adventures")
@Builder
public class GraphicAdventure {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "graphic_adventure_seq_gen")
    @SequenceGenerator(
            name = "graphic_adventure_seq_gen",
            sequenceName = "graphic_adventure_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, unique = true, length = 150)
    private String title;

    @Column(columnDefinition =  "TEXT")
    private String description;

    @Column(length = 100)
    private String initialSceneCode;

    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @OneToMany(mappedBy = "graphicAdventure", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Scene> scenes = new ArrayList<>();

    @OneToMany(mappedBy = "graphicAdventure", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InventoryItem> inventoryItems = new ArrayList<>();

    @OneToMany(mappedBy = "graphicAdventure", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameSave> saves = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
