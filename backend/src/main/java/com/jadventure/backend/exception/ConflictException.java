package com.jadventure.backend.exception;

public class ConflictException extends LocalizedException {
    public ConflictException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
