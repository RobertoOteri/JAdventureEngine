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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FileStorageUtil fileStorageUtil;

    @Transactional(readOnly = true)
    public UserDto getCurrentProfile() {
        return userMapper.toDto(authService.getCurrentUser());
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        User user = authService.getCurrentUser();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailAndIdNot(email, user.getId())) {
            throw new EmailAlreadyExistsException("error.auth.emailTaken", email);
        }

        userMapper.updateProfile(request, user);
        user.setEmail(email);

        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            throw new InvalidOperationException("error.upload.imageRequired");
        }

        User user = authService.getCurrentUser();
        String path = String.format(FileStorageUtil.PATH_USER_AVATAR, user.getUsername(), System.currentTimeMillis());
        user.setAvatarUrl(fileStorageUtil.storeFile(path, avatar));

        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto removeAvatar() {
        User user = authService.getCurrentUser();
        user.setAvatarUrl(null);
        return userMapper.toDto(user);
    }
}