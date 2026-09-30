package com.jadventure.backend.service;

import com.jadventure.backend.dto.auth.AuthRequest;
import com.jadventure.backend.dto.auth.AuthResponse;
import com.jadventure.backend.exception.InvalidCredentialsException;
import com.jadventure.backend.exception.UsernameAlreadyExistsException;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.UserRepository;
import com.jadventure.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String sanitizedUsername = request.getUsername().trim();

        User user = userRepository.findByUsername(sanitizedUsername)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new InvalidCredentialsException("Credenziali non valide"));

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        String sanitizedUsername = request.getUsername().trim();

        if (userRepository.existsByUsername(sanitizedUsername)) {
            throw new UsernameAlreadyExistsException("L'useranme '" + sanitizedUsername + "' è già in uso");
        }
        User newUser = User.builder()
                .username(sanitizedUsername)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser.getUsername());
        return new

                AuthResponse(token, newUser.getUsername());
    }

}
