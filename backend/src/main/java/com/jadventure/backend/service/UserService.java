package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.user.UserDto;
import com.jadventure.backend.dto.user.UpdateProfileRequest;
import com.jadventure.backend.exception.EmailAlreadyExistsException;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.UserMapper;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.UserRepository;
import com.jadventure.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FileStorageUtil fileStorageUtil;
    private final GraphicAdventureService graphicAdventureService;
    private final LeaderboardService leaderboardService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public UserDto getCurrentProfile() {
        log.info("Executing getCurrentProfile");
        UserDto user = toDtoWithStats(authService.getCurrentUser());
        log.info("Executed getCurrentProfile: returning profile of user {}", user.getUsername());
        return user;
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        log.info("Executing updateProfile");
        User user = authService.getCurrentUser();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailAndIdNot(email, user.getId())) {
            log.error("Cannot update profile of user {}: email is already registered", user.getUsername());
            throw new EmailAlreadyExistsException("error.auth.emailTaken", email);
        }

        userMapper.updateProfile(request, user);
        user.setEmail(email);

        UserDto updated = toDtoWithStats(user);
        log.info("Executed updateProfile: profile of user {} updated", updated.getUsername());
        return updated;
    }

    @Transactional
    public UserDto updateAvatar(MultipartFile avatar) {
        log.info("Executing updateAvatar with file size: {} bytes", avatar != null ? avatar.getSize() : 0);
        if (avatar == null || avatar.isEmpty()) {
            log.error("Cannot update avatar: no image provided");
            throw new InvalidOperationException("error.upload.imageRequired");
        }

        User user = authService.getCurrentUser();
        String path = String.format(FileStorageUtil.PATH_USER_AVATAR, user.getUsername(), System.currentTimeMillis());
        user.setAvatarUrl(fileStorageUtil.storeFile(path, avatar));

        UserDto updated = toDtoWithStats(user);
        log.info("Executed updateAvatar: avatar of user {} stored at {}", updated.getUsername(), updated.getAvatarUrl());
        return updated;
    }

    @Transactional
    public UserDto removeAvatar() {
        log.info("Executing removeAvatar");
        User user = authService.getCurrentUser();
        user.setAvatarUrl(null);
        UserDto updated = toDtoWithStats(user);
        log.info("Executed removeAvatar: avatar of user {} removed", updated.getUsername());
        return updated;
    }

    @Transactional(readOnly = true)
    public UserDto getProfileByUsername(String username) {
        log.info("Executing getProfileByUsername with username: {}", username);
        UserDto profile = toDtoWithStats(findByUsername(username));
        log.info("Executed getProfileByUsername: returning profile of user {}", username);
        return profile;
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getPublishedAdventures(String username) {
        log.info("Executing getPublishedAdventures with username: {}", username);
        findByUsername(username);
        List<GraphicAdventureDto> adventures = graphicAdventureService.getPublishedAdventuresByAuthor(username);
        log.info("Executed getPublishedAdventures: returning {} adventures of user {}", adventures.size(), username);
        return adventures;
    }

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User {} not found", username);
                    return new ResourceNotFoundException("error.user.notFound", username);
                });
    }

    private UserDto toDtoWithStats(User user) {
        UserDto dto = userMapper.toDto(user);
        String username = user.getUsername();
        dto.setPublishedAdventures(graphicAdventureService.countPublishedAdventuresByAuthor(username));
        dto.setCompletedAdventures(leaderboardService.countCompletedAdventures(username));
        dto.setReviewsWritten(reviewService.countByUser(username));
        return dto;
    }
}