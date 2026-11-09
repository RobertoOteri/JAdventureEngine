package com.jadventure.backend.exception;

public class ConflictException extends ApplicationException {
    public ConflictException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
