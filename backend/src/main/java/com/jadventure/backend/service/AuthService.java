package com.jadventure.backend.service;

import com.jadventure.backend.dto.auth.AuthRequest;
import com.jadventure.backend.dto.auth.AuthResponse;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.exception.UsernameAlreadyExistsException;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Credenziali non valide"));

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("L'username '" + request.getUsername() + "' è già in uso");
        }
        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser.getUsername());
        return new AuthResponse(token, newUser.getUsername());
    }

    public boolean isUserLoggedIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }


    public String getCurrentUsername() {
        if (!isUserLoggedIn()) {
            throw new AccessDeniedException("Operazione non consentita: utente non autenticato");
        }
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utente autenticato non trovato: " + username));
    }


    public void validateEditable(String ownerUsername, AdventureStatus status) {
        validateOwnership(ownerUsername);
        if (status != AdventureStatus.DRAFT) {
            throw new IllegalStateException("Questa versione è pubblicata e non può essere modificata");
        }
    }

    private void validateOwnership(String ownerUsername) {
        String currentUsername = getCurrentUsername();
        if (ownerUsername == null || !ownerUsername.equals(currentUsername)) {
            throw new AccessDeniedException("Accesso negato: non sei il proprietario di questa risorsa");
        }
    }
}