package com.dishes.demo.utils;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PasswordUtils {

    public static boolean isNotValidPassword(String password) {
        if (password == null || password.isBlank()) {
            return true;
        }

        String trim = password.trim();

        if (trim.length() < 6) {
            return true;
        }

        boolean hasUpper = trim.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = trim.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = trim.chars().anyMatch(Character::isDigit);

        return !(hasUpper && hasLower && hasDigit);
    }
}