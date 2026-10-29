package com.jadventure.backend.dto.action;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextBoxDetailDto {

    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;
    private String fontFamily;
    private String fontSize;
    private String color;
}
