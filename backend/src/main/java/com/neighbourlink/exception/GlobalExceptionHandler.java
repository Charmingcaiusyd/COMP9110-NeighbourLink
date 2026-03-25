package com.neighbourlink.exception;

import java.time.OffsetDateTime;
import javax.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.resolve(exception.getStatus().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        String message = exception.getReason() == null ? "Request could not be processed" : exception.getReason();
        return toResponse(status, message, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        String parameterName = exception.getName();
        String message = "Invalid value for parameter '" + parameterName + "'";
        Class<?> requiredType = exception.getRequiredType();
        if (requiredType != null
                && (Long.class.equals(requiredType)
                || Integer.class.equals(requiredType)
                || long.class.equals(requiredType)
                || int.class.equals(requiredType))) {
            message = "Parameter '" + parameterName + "' must be a number";
        }
        return toResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request
    ) {
        String message = "Missing required parameter '" + exception.getParameterName() + "'";
        return toResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableBody(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return toResponse(HttpStatus.BAD_REQUEST, "Malformed JSON request body", request);
    }

    @ExceptionHandler({
            DataIntegrityViolationException.class,
            CannotAcquireLockException.class,
            PessimisticLockingFailureException.class,
            ObjectOptimisticLockingFailureException.class,
            JpaSystemException.class
    })
    public ResponseEntity<ApiErrorResponse> handleDataConflict(Exception exception, HttpServletRequest request) {
        String details = NestedExceptionUtils.getMostSpecificCause(exception).getMessage();
        if (details != null) {
            String lowered = details.toLowerCase();
            if (lowered.contains("database is locked") || lowered.contains("sqlite_busy")) {
                return toResponse(HttpStatus.CONFLICT, "Database is busy. Please retry this action.", request);
            }
            if (lowered.contains("unique") || lowered.contains("constraint")) {
                return toResponse(HttpStatus.CONFLICT, "Request conflicts with existing data state.", request);
            }
        }
        return toResponse(HttpStatus.CONFLICT, "Request conflicts with current system state.", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
        return toResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", request);
    }

    private ResponseEntity<ApiErrorResponse> toResponse(HttpStatus status, String message, HttpServletRequest request) {
        ApiErrorResponse payload = new ApiErrorResponse(
                OffsetDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(payload);
    }
}
