package com.jadventure.backend.service;

import com.jadventure.backend.exception.TooManyAttemptsException;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Log4j2
public class LoginAttemptService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration BLOCK_DURATION = Duration.ofMinutes(15);

    private final Map<String, Integer> failedAttempts = new ConcurrentHashMap<>();
    private final Map<String, Instant> blockedUntil = new ConcurrentHashMap<>();

    public void validateNotBlocked(String identifier) {
        Instant until = blockedUntil.get(key(identifier));
        if (until != null && until.isAfter(Instant.now())) {
            log.error("Login blocked for identifier {} until {}", identifier, until);
            throw new TooManyAttemptsException("error.auth.tooManyAttempts", BLOCK_DURATION.toMinutes());
        }
    }

    public void registerFailure(String identifier) {
        String key = key(identifier);
        int failures = failedAttempts.merge(key, 1, Integer::sum);
        if (failures >= MAX_FAILED_ATTEMPTS) {
            failedAttempts.remove(key);
            blockedUntil.put(key, Instant.now().plus(BLOCK_DURATION));
            log.warn("Identifier {} blocked for {} minutes after {} failed logins", identifier, BLOCK_DURATION.toMinutes(), failures);
        }
    }

    public void registerSuccess(String identifier) {
        String key = key(identifier);
        failedAttempts.remove(key);
        blockedUntil.remove(key);
    }

    private String key(String identifier) {
        return identifier.trim().toLowerCase(Locale.ROOT);
    }
}
