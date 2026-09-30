package com.jadventure.backend.service;

import com.jadventure.backend.dto.auth.AuthRequest;
import com.jadventure.backend.dto.auth.AuthResponse;
import com.jadventure.backend.exception.UsernameAlreadyExistsException;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.UserRepository;
import com.jadventure.backend.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
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

        User user = userRepository.findByUsername(request.getUsername())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Credenziali non valide"));

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("L'useranme '" + request.getUsername() + "' è già in uso");
        }
        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(newUser);

        String token = jwtService.generateToken(newUser.getUsername());

        return new AuthResponse(token, newUser.getUsername());
    }

}
