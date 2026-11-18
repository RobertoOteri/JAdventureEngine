package com.jadventure.backend.dto.game;

import com.jadventure.backend.dto.action.TextBoxDto;
import com.jadventure.backend.model.enums.ActionType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameItemActionDto {

    private ActionType type;

    private TextBoxDto inputBox;
}
