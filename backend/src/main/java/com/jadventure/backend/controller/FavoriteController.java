package com.jadventure.backend.controller;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/favorites")
@RequiredArgsConstructor
@Log4j2
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<GraphicAdventureDto>> getMyFavorites() {
        log.info("Received GET request for the current user favorites");
        List<GraphicAdventureDto> favorites = favoriteService.getMyFavorites();
        log.info("Returning {} favorites", favorites.size());
        return ResponseEntity.ok(favorites);
    }

    @PutMapping("/{adventureCode}")
    public ResponseEntity<Void> addFavorite(@PathVariable String adventureCode) {
        log.info("Received PUT request to add adventure {} to favorites", adventureCode);
        favoriteService.addFavorite(adventureCode);
        log.info("Adventure {} is now a favorite", adventureCode);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{adventureCode}")
    public ResponseEntity<Void> removeFavorite(@PathVariable String adventureCode) {
        log.info("Received DELETE request to remove adventure {} from favorites", adventureCode);
        favoriteService.removeFavorite(adventureCode);
        log.info("Adventure {} is no longer a favorite", adventureCode);
        return ResponseEntity.noContent().build();
    }
}