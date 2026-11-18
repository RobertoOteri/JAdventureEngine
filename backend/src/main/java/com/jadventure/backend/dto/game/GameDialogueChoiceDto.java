package com.jadventure.backend.dto.game;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDialogueChoiceDto {

    private Long id;

    private String text;
}
