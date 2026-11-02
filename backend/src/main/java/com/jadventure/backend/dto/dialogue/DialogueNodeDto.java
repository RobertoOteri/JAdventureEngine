package com.jadventure.backend.dto.dialogue;

import com.jadventure.backend.dto.action.GameEffectDto;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DialogueNodeDto {

    private String code;
    private String text;
    private List<DialogueChoiceDto> choices = new ArrayList<>();
    private List<GameEffectDto> effects = new ArrayList<>();
}
