package org.opengeo.app;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Bad Request (400) error.
 */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        this(message, null);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
