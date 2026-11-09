package com.jadventure.backend.exception;

public class UsernameAlreadyExistsException extends ApplicationException {
    public UsernameAlreadyExistsException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
