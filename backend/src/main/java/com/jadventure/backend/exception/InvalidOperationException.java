package com.jadventure.backend.exception;

public class InvalidOperationException extends ApplicationException {
    public InvalidOperationException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
