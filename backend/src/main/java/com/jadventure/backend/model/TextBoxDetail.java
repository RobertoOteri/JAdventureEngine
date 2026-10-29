package com.jadventure.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextBoxDetail {

    @Column(name = "pos_x")
    private Integer posX;

    @Column(name = "pos_y")
    private Integer posY;

    private Integer width;
    private Integer height;

    @Column(name = "font_family")
    private String fontFamily;

    @Column(name = "font_size")
    private String fontSize;

    @Column(name = "color", length = 20)
    private String color;
}
