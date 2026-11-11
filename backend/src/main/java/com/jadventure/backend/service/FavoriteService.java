package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GraphicAdventureMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.User;
import com.jadventure.backend.model.enums.AdventureStatus;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Log4j2
public class FavoriteService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final GraphicAdventureRepository graphicAdventureRepository;
    private final GraphicAdventureMapper graphicAdventureMapper;


    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getMyFavorites() {
        log.info("Executing getMyFavorites");
        User user = authService.getCurrentUser();
        Set<String> codes = user.getFavoriteAdventureCodes();

        if (codes.isEmpty()) {
            log.info("Executed getMyFavorites: user {} has no favorites", user.getUsername());
            return List.of();
        }

        Map<String, GraphicAdventure> latestByCode = new LinkedHashMap<>();
        graphicAdventureRepository
                .findAllByCodeInAndStatusOrderByCodeAscVersionNumberDesc(codes, AdventureStatus.PUBLISHED)
                .forEach(adventure -> latestByCode.putIfAbsent(adventure.getCode(), adventure));

        List<GraphicAdventure> adventures = latestByCode.values().stream()
                .sorted(Comparator.comparing(GraphicAdventure::getTitle, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<GraphicAdventureDto> favorites = graphicAdventureMapper.toDtoList(adventures);
        log.info("Executed getMyFavorites: returning {} favorites for user {}", favorites.size(), user.getUsername());
        return favorites;
    }

    @Transactional
    public void addFavorite(String adventureCode) {
        log.info("Executing addFavorite with adventureCode: {}", adventureCode);
        User user = authService.getCurrentUser();

        if (!graphicAdventureRepository.existsByCodeAndStatus(adventureCode, AdventureStatus.PUBLISHED)) {
            log.error("Cannot add favorite: no published adventure with code {}", adventureCode);
            throw new ResourceNotFoundException("error.adventure.notFoundByCode", adventureCode);
        }

        boolean added = user.getFavoriteAdventureCodes().add(adventureCode);
        log.info("Executed addFavorite: adventure {} {} favorites of user {}",
                adventureCode, added ? "added to" : "was already in", user.getUsername());
    }

    @Transactional
    public void removeFavorite(String adventureCode) {
        log.info("Executing removeFavorite with adventureCode: {}", adventureCode);
        User user = authService.getCurrentUser();
        boolean removed = user.getFavoriteAdventureCodes().remove(adventureCode);
        log.info("Executed removeFavorite: adventure {} {} favorites of user {}",
                adventureCode, removed ? "removed from" : "was not in", user.getUsername());
    }

    @Transactional
    public void removeFavoritesOfAdventure(String adventureCode) {
        log.info("Executing removeFavoritesOfAdventure with adventureCode: {}", adventureCode);
        List<User> users = userRepository.findAllByFavoriteAdventureCodesContains(adventureCode);
        users.forEach(user -> user.getFavoriteAdventureCodes().remove(adventureCode));
        log.info("Executed removeFavoritesOfAdventure: adventure {} removed from favorites of {} users",
                adventureCode, users.size());
    }
}