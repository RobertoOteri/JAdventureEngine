package com.jadventure.backend.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {

    private Long id;
    private Long adventureId;
    private Integer versionNumber;
    private String username;
    private String avatarUrl;

    @NotNull(message = "validation.review.rating.required")
    @Min(value = 1, message = "validation.review.rating.range")
    @Max(value = 5, message = "validation.review.rating.range")
    private Integer rating;

    @Size(max = 2000, message = "validation.review.comment.tooLong")
    private String comment;

    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}