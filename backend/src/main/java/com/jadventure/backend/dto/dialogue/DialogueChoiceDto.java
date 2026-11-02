package com.jadventure.backend.dto.dialogue;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.action.PreconditionDto;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DialogueChoiceDto {

    private Long id;
    private String text;
    private String nextNodeCode;
    private List<PreconditionDto> preconditions = new ArrayList<>();
    private List<GameEffectDto> effects = new ArrayList<>();
}
