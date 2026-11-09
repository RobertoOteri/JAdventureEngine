package com.jadventure.backend.exception;

public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String messageKey, Object... args) {
        super(messageKey, args);
    }
}
