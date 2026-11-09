package com.jadventure.backend.service;

import com.jadventure.backend.dto.auth.AuthResponse;
import com.jadventure.backend.dto.auth.LoginRequest;
import com.jadventure.backend.dto.auth.RegisterRequest;
import com.jadventure.backend.exception.ConflictException;
import com.jadventure.backend.exception.EmailAlreadyExistsException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.exception.UsernameAlreadyExistsException;
import com.jadventure.backend.mapper.UserMapper;
import com.jadventure.backend.model.User;
import com.jadventure.backend.model.enums.AdventureStatus;
import com.jadventure.backend.repository.UserRepository;
import com.jadventure.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        User user = userRepository.findByUsernameOrEmail(identifier, normalizeEmail(identifier))
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("error.auth.invalidCredentials"));

        return new AuthResponse(jwtService.generateToken(user.getUsername()), user.getUsername());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("error.auth.usernameTaken", request.getUsername());
        }
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("error.auth.emailTaken", email);
        }

        User user = userMapper.toEntity(request);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user.getUsername()), user.getUsername());
    }

    public boolean isUserLoggedIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    public String getCurrentUsername() {
        if (!isUserLoggedIn()) {
            throw new AccessDeniedException("error.auth.notAuthenticated");
        }
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("error.user.authenticatedNotFound", username));
    }

    public void validateEditable(String ownerUsername, AdventureStatus status) {
        validateOwnership(ownerUsername);
        if (status != AdventureStatus.DRAFT) {
            throw new ConflictException("error.adventure.versionPublished");
        }
    }

    private void validateOwnership(String ownerUsername) {
        String currentUsername = getCurrentUsername();
        if (ownerUsername == null || !ownerUsername.equals(currentUsername)) {
            throw new AccessDeniedException("error.auth.notOwner");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}