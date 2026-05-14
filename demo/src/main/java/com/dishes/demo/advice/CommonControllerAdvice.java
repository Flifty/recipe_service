package com.dishes.demo.advice;

import com.dishes.demo.model.exception.DataExistException;
import com.dishes.demo.model.exception.InvalidDataException;
import com.dishes.demo.model.exception.InvalidPasswordException;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.response.recipe.DishesResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CommonControllerAdvice {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<DishesResponse<Void>> handleNotFoundException(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(DishesResponse.createFailed(ex.getMessage()));
    }

    @ExceptionHandler({DataExistException.class, InvalidDataException.class, InvalidPasswordException.class})
    public ResponseEntity<DishesResponse<Void>> handleBadRequestException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(DishesResponse.createFailed(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<DishesResponse<Void>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(DishesResponse.createFailed(ex.getMessage()));
    }
}