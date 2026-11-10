package com.jadventure.backend.exception;

public class UnauthorizedException extends ApplicationException {
    public UnauthorizedException(String code, Object... args) {
        super(code, args);
    }
}
