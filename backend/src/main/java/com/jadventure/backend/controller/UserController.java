package com.jadventure.backend.controller;

import com.jadventure.backend.dto.auth.UserDto;
import com.jadventure.backend.dto.user.UpdateProfileRequest;
import com.jadventure.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserDto> getProfile() {
        return ResponseEntity.ok(userService.getCurrentProfile());
    }

    @PutMapping
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> uploadAvatar(@RequestPart("avatar") MultipartFile avatar) {
        return ResponseEntity.ok(userService.updateAvatar(avatar));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<UserDto> removeAvatar() {
        return ResponseEntity.ok(userService.removeAvatar());
    }
}