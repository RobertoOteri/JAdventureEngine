package com.jadventure.backend.dto.game;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDialogueDto {

    private String code;

    private String text;

    private List<GameDialogueChoiceDto> choices;
}
