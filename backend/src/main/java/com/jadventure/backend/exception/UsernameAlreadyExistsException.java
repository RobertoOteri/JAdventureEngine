package com.jadventure.backend.exception;

public class UsernameAlreadyExistsException extends LocalizedException {
    public UsernameAlreadyExistsException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
