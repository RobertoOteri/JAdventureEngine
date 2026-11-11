package com.jadventure.backend.service;

import com.jadventure.backend.dto.review.RatingSummaryDto;
import com.jadventure.backend.dto.review.ReviewDto;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.ReviewMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Review;
import com.jadventure.backend.model.User;
import com.jadventure.backend.model.enums.AdventureStatus;
import com.jadventure.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ReviewService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final GraphicAdventureService graphicAdventureService;
    private final LeaderboardService leaderboardService;
    private final GameSaveService gameSaveService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviews(Long adventureId, int page, int size) {
        log.info("Executing getReviews with adventureId: {}, page: {}, size: {}", adventureId, page, size);
        String code = graphicAdventureService.findReadableAdventure(adventureId).getCode();

        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        List<Review> reviews = reviewRepository.findAllByGraphicAdventureCodeOrderByUpdatedAtDesc(code, pageRequest);

        Set<String> usernames = reviews.stream()
                .map(review -> review.getUser().getUsername())
                .collect(Collectors.toSet());
        Set<String> completedBy = leaderboardService.findUsernamesWhoCompleted(code, usernames);

        List<ReviewDto> result = reviews.stream()
                .map(review -> toDto(review, completedBy.contains(review.getUser().getUsername())))
                .toList();

        log.info("Executed getReviews: returning {} reviews for adventure {}", result.size(), code);
        return result;
    }

    @Transactional(readOnly = true)
    public RatingSummaryDto getSummary(Long adventureId) {
        log.info("Executing getSummary with adventureId: {}", adventureId);
        String code = graphicAdventureService.findReadableAdventure(adventureId).getCode();
        RatingSummaryDto summary = buildSummary(code, reviewRepository.findAllByGraphicAdventureCode(code));
        log.info("Executed getSummary: adventure {} has {} reviews, average {}",
                code, summary.getReviewCount(), summary.getAverageRating());
        return summary;
    }

    @Transactional(readOnly = true)
    public List<RatingSummaryDto> getSummaries(Collection<String> adventureCodes) {
        log.info("Executing getSummaries with {} adventure codes", adventureCodes.size());
        if (adventureCodes.isEmpty()) {
            return List.of();
        }
        Map<String, List<Review>> reviewsByCode = reviewRepository.findAllByGraphicAdventureCodeIn(adventureCodes)
                .stream()
                .collect(Collectors.groupingBy(review -> review.getGraphicAdventure().getCode()));

        List<RatingSummaryDto> summaries = adventureCodes.stream()
                .distinct()
                .map(code -> buildSummary(code, reviewsByCode.getOrDefault(code, List.of())))
                .toList();
        log.info("Executed getSummaries: returning {} summaries", summaries.size());
        return summaries;
    }

    @Transactional(readOnly = true)
    public ReviewDto getMyReview(Long adventureId) {
        log.info("Executing getMyReview with adventureId: {}", adventureId);
        String code = graphicAdventureService.findReadableAdventure(adventureId).getCode();
        String username = authService.getCurrentUsername();

        ReviewDto review = reviewRepository.findByUserUsernameAndGraphicAdventureCode(username, code)
                .map(entity -> toDto(entity, leaderboardService.hasCompleted(username, code)))
                .orElse(null);
        log.info("Executed getMyReview: user {} on adventure {} hasReview={}", username, code, review != null);
        return review;
    }

    @Transactional(readOnly = true)
    public boolean canReview(Long adventureId) {
        log.info("Executing canReview with adventureId: {}", adventureId);
        GraphicAdventure adventure = graphicAdventureService.findReadableAdventure(adventureId);
        String username = authService.getCurrentUsername();
        boolean allowed = findBlockReason(adventure, username).isEmpty();
        log.info("Executed canReview: user {} on adventure {} allowed={}", username, adventure.getCode(), allowed);
        return allowed;
    }

    @Transactional
    public ReviewDto saveMyReview(Long adventureId, ReviewDto request) {
        log.info("Executing saveMyReview with adventureId: {}, rating: {}", adventureId, request.getRating());
        GraphicAdventure adventure = graphicAdventureService.findReadableAdventure(adventureId);
        User user = authService.getCurrentUser();
        String code = adventure.getCode();

        findBlockReason(adventure, user.getUsername()).ifPresent(reason -> {
            log.error("User {} cannot review adventure {}: {}", user.getUsername(), code, reason);
            throw new InvalidOperationException(reason);
        });

        Review review = reviewRepository.findByUserUsernameAndGraphicAdventureCode(user.getUsername(), code)
                .orElseGet(() -> Review.builder()
                        .user(user)
                        .build());
        boolean isNew = review.getId() == null;

        review.setGraphicAdventure(adventure);
        review.setRating(request.getRating());
        review.setComment(normalizeComment(request.getComment()));

        ReviewDto saved = toDto(reviewRepository.save(review), leaderboardService.hasCompleted(user.getUsername(), code));
        log.info("Executed saveMyReview: review {} by user {} on adventure {} (version {})",
                isNew ? "created" : "updated", user.getUsername(), code, adventure.getVersionNumber());
        return saved;
    }

    @Transactional
    public void deleteMyReview(Long adventureId) {
        log.info("Executing deleteMyReview with adventureId: {}", adventureId);
        String code = graphicAdventureService.findReadableAdventure(adventureId).getCode();
        String username = authService.getCurrentUsername();

        Review review = reviewRepository.findByUserUsernameAndGraphicAdventureCode(username, code)
                .orElseThrow(() -> {
                    log.error("No review by user {} on adventure {}", username, code);
                    return new ResourceNotFoundException("error.review.notFound");
                });

        reviewRepository.delete(review);
        log.info("Executed deleteMyReview: review by user {} on adventure {} deleted", username, code);
    }

    private Optional<String> findBlockReason(GraphicAdventure adventure, String username) {
        String code = adventure.getCode();
        if (adventure.getAuthor().getUsername().equals(username)) {
            return Optional.of("error.review.ownAdventure");
        }
        if (adventure.getStatus() != AdventureStatus.PUBLISHED) {
            return Optional.of("error.review.notPublished");
        }
        if (!leaderboardService.hasCompleted(username, code) && !gameSaveService.hasPlayed(username, code)) {
            return Optional.of("error.review.notPlayed");
        }
        return Optional.empty();
    }

    private RatingSummaryDto buildSummary(String adventureCode, List<Review> reviews) {
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int stars = 1; stars <= 5; stars++) {
            distribution.put(stars, 0L);
        }
        reviews.forEach(review -> distribution.merge(review.getRating(), 1L, Long::sum));

        Double average = reviews.isEmpty()
                ? null
                : Math.round(reviews.stream().mapToInt(Review::getRating).average().orElse(0) * 10) / 10.0;

        return RatingSummaryDto.builder()
                .adventureCode(adventureCode)
                .averageRating(average)
                .reviewCount(reviews.size())
                .distribution(distribution)
                .build();
    }

    private ReviewDto toDto(Review review, boolean completed) {
        ReviewDto dto = reviewMapper.toDto(review);
        dto.setCompleted(completed);
        return dto;
    }

    private String normalizeComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        return comment.trim();
    }
}