package com.jadventure.backend.exception;

import com.jadventure.backend.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String ERROR_CODE_PREFIX = "error.";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Not Found", ex.getCode(), ex.getArgs());
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOperation(InvalidOperationException ex) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", ex.getCode(), ex.getArgs());
    }

    @ExceptionHandler({UsernameAlreadyExistsException.class, EmailAlreadyExistsException.class, ConflictException.class})
    public ResponseEntity<ErrorResponse> handleConflict(ApplicationException ex) {
        return build(HttpStatus.CONFLICT, "Conflict", ex.getCode(), ex.getArgs());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, "Bad Request", "error.generic.badRequest");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        return build(HttpStatus.CONFLICT, "Conflict", "error.generic.conflict");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Unauthorized",
                codeOrDefault(ex.getMessage(), "error.auth.invalidCredentials"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "Forbidden",
                codeOrDefault(ex.getMessage(), "error.auth.forbidden"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        String code = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("error.validation.generic");
        return build(HttpStatus.BAD_REQUEST, "Bad Request", code);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ex.printStackTrace();
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "error.generic.internal");
    }

    private String codeOrDefault(String message, String defaultCode) {
        return message != null && message.startsWith(ERROR_CODE_PREFIX) ? message : defaultCode;
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String error, String code, Object... args) {
        List<String> params = args == null || args.length == 0
                ? null
                : Arrays.stream(args).map(String::valueOf).toList();

        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .code(code)
                .params(params)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(status).body(response);
    }
}