package com.jadventure.backend.exception;

public class InvalidOperationException extends LocalizedException {
    public InvalidOperationException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
