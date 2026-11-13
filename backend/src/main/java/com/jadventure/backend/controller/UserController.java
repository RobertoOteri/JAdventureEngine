package com.jadventure.backend.controller;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.user.UpdateProfileRequest;
import com.jadventure.backend.dto.user.UserDto;
import com.jadventure.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Log4j2
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile() {
        log.info("Received GET request for the current user profile");
        UserDto user = userService.getCurrentProfile();
        log.info("Returning profile of user {}", user.getId());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        log.info("Received PUT request to update the current user profile");
        UserDto user = userService.updateProfile(request);
        log.info("Profile of user {} updated successfully", user.getId());
        return ResponseEntity.ok(user);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> uploadAvatar(@RequestPart("avatar") MultipartFile avatar) {
        log.info("Received POST request to upload an avatar ({} bytes)", avatar.getSize());
        UserDto user = userService.updateAvatar(avatar);
        log.info("Avatar of user {} updated successfully", user.getId());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<UserDto> removeAvatar() {
        log.info("Received DELETE request to remove the avatar");
        UserDto user = userService.removeAvatar();
        log.info("Avatar of user {} removed successfully", user.getId());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getProfileByUsername(@PathVariable String username) {
        log.info("Received GET request for the profile of user {}", username);
        UserDto user = userService.getProfileByUsername(username);
        log.info("Returning profile of user {}", username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}/adventures")
    public ResponseEntity<List<GraphicAdventureDto>> getPublishedAdventures(@PathVariable String username) {
        log.info("Received GET request for the published adventures of user {}", username);
        List<GraphicAdventureDto> adventures = userService.getPublishedAdventures(username);
        log.info("Returning {} published adventures of user {}", adventures.size(), username);
        return ResponseEntity.ok(adventures);
    }
}