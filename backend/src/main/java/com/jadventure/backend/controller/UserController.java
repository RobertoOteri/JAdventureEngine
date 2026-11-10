package com.jadventure.backend.controller;

import com.jadventure.backend.dto.user.UserDto;
import com.jadventure.backend.dto.user.UpdateProfileRequest;
import com.jadventure.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
@Log4j2
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserDto> getProfile() {
        log.info("Received GET request for the current user profile");
        UserDto user = userService.getCurrentProfile();
        log.info("Returning profile of user {}", user.getId());
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        log.info("Received PUT request to update the current user profile");
        UserDto user = userService.updateProfile(request);
        log.info("Profile of user {} updated successfully", user.getId());
        return ResponseEntity.ok(user);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> uploadAvatar(@RequestPart("avatar") MultipartFile avatar) {
        log.info("Received POST request to upload an avatar ({} bytes)", avatar.getSize());
        UserDto user = userService.updateAvatar(avatar);
        log.info("Avatar of user {} updated successfully", user.getId());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<UserDto> removeAvatar() {
        log.info("Received DELETE request to remove the avatar");
        UserDto user = userService.removeAvatar();
        log.info("Avatar of user {} removed successfully", user.getId());
        return ResponseEntity.ok(user);
    }
}
