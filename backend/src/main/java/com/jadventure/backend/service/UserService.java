package com.jadventure.backend.service;

import com.jadventure.backend.dto.user.UserDto;
import com.jadventure.backend.dto.user.UpdateProfileRequest;
import com.jadventure.backend.exception.EmailAlreadyExistsException;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.mapper.UserMapper;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.UserRepository;
import com.jadventure.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FileStorageUtil fileStorageUtil;

    @Transactional(readOnly = true)
    public UserDto getCurrentProfile() {
        log.info("Executing getCurrentProfile");
        UserDto user = userMapper.toDto(authService.getCurrentUser());
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

        UserDto updated = userMapper.toDto(user);
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

        UserDto updated = userMapper.toDto(user);
        log.info("Executed updateAvatar: avatar of user {} stored at {}", updated.getUsername(), updated.getAvatarUrl());
        return updated;
    }

    @Transactional
    public UserDto removeAvatar() {
        log.info("Executing removeAvatar");
        User user = authService.getCurrentUser();
        user.setAvatarUrl(null);
        UserDto updated = userMapper.toDto(user);
        log.info("Executed removeAvatar: avatar of user {} removed", updated.getUsername());
        return updated;
    }
}