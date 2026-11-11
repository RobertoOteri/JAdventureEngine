package com.jadventure.backend.dto.review;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryDto {

    private String adventureCode;
    private Double averageRating;
    private long reviewCount;
    private Map<Integer, Long> distribution;
}