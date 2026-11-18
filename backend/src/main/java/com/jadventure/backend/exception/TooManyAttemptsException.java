package com.jadventure.backend.exception;

public class TooManyAttemptsException extends ApplicationException {
    public TooManyAttemptsException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
