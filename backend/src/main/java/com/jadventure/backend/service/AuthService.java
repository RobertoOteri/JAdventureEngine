package com.jadventure.backend.service;

import com.jadventure.backend.dto.auth.AuthResponse;
import com.jadventure.backend.dto.auth.LoginRequest;
import com.jadventure.backend.dto.auth.RegisterRequest;
import com.jadventure.backend.exception.ConflictException;
import com.jadventure.backend.exception.UnauthorizedException;
import com.jadventure.backend.exception.EmailAlreadyExistsException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.exception.UsernameAlreadyExistsException;
import com.jadventure.backend.mapper.UserMapper;
import com.jadventure.backend.model.User;
import com.jadventure.backend.model.enums.AdventureStatus;
import com.jadventure.backend.repository.UserRepository;
import com.jadventure.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
@Log4j2
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;


    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Executing login");
        String identifier = request.getIdentifier().trim();
        loginAttemptService.validateNotBlocked(identifier);

        User user = userRepository.findByUsernameOrEmail(identifier, normalizeEmail(identifier))
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> {
                    log.error("Login failed: invalid credentials");
                    loginAttemptService.registerFailure(identifier);
                    return new BadCredentialsException("error.auth.invalidCredentials");
                });

        loginAttemptService.registerSuccess(identifier);

        AuthResponse response = new AuthResponse(jwtService.generateToken(user.getUsername()), user.getUsername());
        log.info("Executed login: user {} authenticated", user.getUsername());
        return response;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Executing register with username: {}", request.getUsername());
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.error("Registration failed: username {} is already taken", request.getUsername());
            throw new UsernameAlreadyExistsException("error.auth.usernameTaken", request.getUsername());
        }
        if (userRepository.existsByEmail(email)) {
            log.error("Registration failed for username {}: email is already registered", request.getUsername());
            throw new EmailAlreadyExistsException("error.auth.emailTaken", email);
        }

        User user = userMapper.toEntity(request);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        AuthResponse response = new AuthResponse(jwtService.generateToken(user.getUsername()), user.getUsername());
        log.info("Executed register: user {} created with id {}", user.getUsername(), user.getId());
        return response;
    }

    public boolean isUserLoggedIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean loggedIn = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
        log.debug("Executed isUserLoggedIn: {}", loggedIn);
        return loggedIn;
    }

    public String getCurrentUsername() {
        log.debug("Executing getCurrentUsername");
        if (!isUserLoggedIn()) {
            log.error("Cannot get current username: user is not authenticated");
            throw new UnauthorizedException("error.auth.notAuthenticated");
        }
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Executed getCurrentUsername: {}", username);
        return username;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        log.debug("Executing getCurrentUser");
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("Authenticated user {} not found in the database", username);
                    return new ResourceNotFoundException("error.user.authenticatedNotFound", username);
                });
        log.debug("Executed getCurrentUser: returning user {} with id {}", user.getUsername(), user.getId());
        return user;
    }

    public void validateEditable(String ownerUsername, AdventureStatus status) {
        log.debug("Executing validateEditable with ownerUsername: {}, status: {}", ownerUsername, status);
        validateOwnership(ownerUsername);
        if (status != AdventureStatus.DRAFT) {
            log.error("Adventure owned by {} is not editable: status is {}", ownerUsername, status);
            throw new ConflictException("error.adventure.versionPublished");
        }
        log.debug("Executed validateEditable: adventure is editable");
    }

    public void validateOwnership(String ownerUsername) {
        String currentUsername = getCurrentUsername();
        if (ownerUsername == null || !ownerUsername.equals(currentUsername)) {
            log.error("Access denied: user {} is not the owner (owner: {})", currentUsername, ownerUsername);
            throw new AccessDeniedException("error.auth.notOwner");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
