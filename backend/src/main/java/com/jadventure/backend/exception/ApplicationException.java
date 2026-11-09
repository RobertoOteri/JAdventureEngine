package com.jadventure.backend.exception;

public abstract class ApplicationException extends RuntimeException {

    private final String code;
    private final transient Object[] args;

    protected ApplicationException(String code, Object... args) {
        super(code);
        this.code = code;
        this.args = args;
    }

    public String getCode() {
        return code;
    }

    public Object[] getArgs() {
        return args;
    }
}