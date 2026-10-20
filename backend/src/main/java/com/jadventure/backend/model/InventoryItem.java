package com.jadventure.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "inventory_items",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"graphic_adventure_id", "code"})
        }
)
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inventory_item_seq_gen")
    @SequenceGenerator(
            name = "inventory_item_seq_gen",
            sequenceName = "inventory_item_seq",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graphic_adventure_id", nullable = false, updatable = false)
    private GraphicAdventure graphicAdventure;
}
