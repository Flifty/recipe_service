package com.dishes.demo.model.constants;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public enum ApiErrorMessage {
    USER_NOT_FOUND_BY_ID("User with ID: %s was not found"),
    RECIPE_NOT_FOUND_BY_ID("Recipe with ID: %s was not found"),
    CATEGORY_NOT_FOUND_BY_ID("Category with ID: %s was not found"),
    CUISINE_NOT_FOUND_BY_ID("Cuisine with ID: %s was not found"),
    INGREDIENT_NOT_FOUND_BY_ID("Ingredient with ID: %s was not found"),

    EMAIL_ALREADY_EXISTS("User with email %s already exists"),
    USERNAME_ALREADY_EXISTS("User with username %s already exists"),

    HAVE_NO_ACCESS("You do not have access"),
    TOKEN_EXPIRED("Token expired"),
    INVALID_TOKEN_SIGNATURE("Invalid token signature"),
    ERROR_DURING_JWT_PROCESSING("Error during JWT processing"),
    UNEXPECTED_ERROR_OCCURRED("Unexpected error occurred"),
    INVALID_USER_OR_PASSWORD("Invalid email or password"),
    NOT_FOUND_REFRESH_TOKEN("Refresh token was not found"),
    INVALID_PASSWORD("Password is invalid"),
    MISMATCH_PASSWORDS("Passwords do not match"),
    PASSWORD_CHANGED_SUCCESSFULLY("Password changed successfully");

    private final String message;

    public String getMessage(Object... args) {
        return String.format(message, args);
    }
}