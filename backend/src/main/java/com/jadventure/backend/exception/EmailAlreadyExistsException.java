package com.jadventure.backend.exception;

public class EmailAlreadyExistsException extends LocalizedException {
    public EmailAlreadyExistsException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
