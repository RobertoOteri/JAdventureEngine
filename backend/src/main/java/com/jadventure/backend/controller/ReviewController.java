package com.jadventure.backend.controller;

import com.jadventure.backend.dto.review.RatingSummaryDto;
import com.jadventure.backend.dto.review.ReviewDto;
import com.jadventure.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Log4j2
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/adventures/{adventureId}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviews(
            @PathVariable Long adventureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Received GET request for reviews of adventure {} (page {}, size {})", adventureId, page, size);
        List<ReviewDto> reviews = reviewService.getReviews(adventureId, page, size);
        log.info("Returning {} reviews of adventure {}", reviews.size(), adventureId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/adventures/{adventureId}/reviews/summary")
    public ResponseEntity<RatingSummaryDto> getSummary(@PathVariable Long adventureId) {
        log.info("Received GET request for the rating summary of adventure {}", adventureId);
        RatingSummaryDto summary = reviewService.getSummary(adventureId);
        log.info("Returning rating summary of adventure {}", adventureId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/reviews/summaries")
    public ResponseEntity<List<RatingSummaryDto>> getSummaries(@RequestParam List<String> codes) {
        log.info("Received GET request for rating summaries of {} adventures", codes.size());
        List<RatingSummaryDto> summaries = reviewService.getSummaries(codes);
        log.info("Returning {} rating summaries", summaries.size());
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/adventures/{adventureId}/reviews/me")
    public ResponseEntity<ReviewDto> getMyReview(@PathVariable Long adventureId) {
        log.info("Received GET request for the current user review of adventure {}", adventureId);
        ReviewDto review = reviewService.getMyReview(adventureId);
        if (review == null) {
            log.info("Current user has no review for adventure {}", adventureId);
            return ResponseEntity.noContent().build();
        }
        log.info("Returning current user review {} of adventure {}", review.getId(), adventureId);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/adventures/{adventureId}/reviews/me/allowed")
    public ResponseEntity<Boolean> canReview(@PathVariable Long adventureId) {
        log.info("Received GET request to check if current user can review adventure {}", adventureId);
        boolean allowed = reviewService.canReview(adventureId);
        log.info("Current user can review adventure {}: {}", adventureId, allowed);
        return ResponseEntity.ok(allowed);
    }

    @PutMapping("/adventures/{adventureId}/reviews/me")
    public ResponseEntity<ReviewDto> saveMyReview(
            @PathVariable Long adventureId,
            @Valid @RequestBody ReviewDto request) {
        log.info("Received PUT request to save the current user review of adventure {}", adventureId);
        ReviewDto saved = reviewService.saveMyReview(adventureId, request);
        log.info("Saved review {} of adventure {}", saved.getId(), adventureId);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/adventures/{adventureId}/reviews/me")
    public ResponseEntity<Void> deleteMyReview(@PathVariable Long adventureId) {
        log.info("Received DELETE request for the current user review of adventure {}", adventureId);
        reviewService.deleteMyReview(adventureId);
        log.info("Deleted current user review of adventure {}", adventureId);
        return ResponseEntity.noContent().build();
    }
}