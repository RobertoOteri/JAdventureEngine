package com.jadventure.backend.dto.adventure;

import com.jadventure.backend.model.enums.AdventureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphicAdventureDto {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String coverImageUrl;
    private String initialSceneCode;
    private Integer versionNumber;
    private AdventureStatus status;
    private LocalDateTime publishedAt;
    private String authorUsername;
    private LocalDateTime createdAt;
}
