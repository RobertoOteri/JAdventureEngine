package com.jadventure.backend.exception;

public abstract class LocalizedException extends RuntimeException {

    private final transient Object[] args;

    protected LocalizedException(String messageKey, Object... args) {
        super(messageKey);
        this.args = args;
    }

    public String getMessageKey() {
        return getMessage();
    }

    public Object[] getArgs() {
        return args;
    }
}