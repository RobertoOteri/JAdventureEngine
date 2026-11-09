package com.jadventure.backend.exception;

public class EmailAlreadyExistsException extends ApplicationException {
    public EmailAlreadyExistsException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
