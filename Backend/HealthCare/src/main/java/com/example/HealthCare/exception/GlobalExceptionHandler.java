package com.example.HealthCare.exception;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "validation_error");
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("details", errors.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining(", ")));
        
        log.error("Validation error: {}", response);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequestException(BadRequestException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "bad_request");
        response.put("message", ex.getMessage());
        
        log.error("Bad request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(NotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "not_found");
        response.put("message", ex.getMessage());
        
        log.error("Not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, Object>> handleNullPointerException(NullPointerException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "internal_error");
        response.put("message", "An unexpected error occurred: NullPointerException");
        
        log.error("NullPointerException occurred: {}", ex.getMessage(), ex);
        // Log stack trace to help debug
        StackTraceElement[] stackTrace = ex.getStackTrace();
        if (stackTrace != null && stackTrace.length > 0) {
            log.error("NullPointerException at: {}:{}", stackTrace[0].getClassName(), stackTrace[0].getLineNumber());
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        String errorMessage = ex.getMessage();
        if (errorMessage == null || errorMessage.trim().isEmpty()) {
            errorMessage = "An unexpected error occurred: " + ex.getClass().getSimpleName();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("error", "internal_error");
        response.put("message", errorMessage);
        
        log.error("Runtime exception: {} - Class: {}", errorMessage, ex.getClass().getName(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "internal_server_error");
        response.put("message", "An unexpected error occurred. Please try again later.");
        
        log.error("Unexpected exception: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

