package com.jadventure.backend.controller;

import com.jadventure.backend.dto.auth.AuthResponse;
import com.jadventure.backend.dto.auth.LoginRequest;
import com.jadventure.backend.dto.auth.RegisterRequest;
import com.jadventure.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Received login request");
        AuthResponse response = authService.login(request);
        log.info("Login completed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Received registration request");
        AuthResponse response = authService.register(request);
        log.info("Registration completed successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
