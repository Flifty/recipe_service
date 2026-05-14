package com.dishes.demo.security.validation;

import com.dishes.demo.model.request.user.ChangePasswordRequest;
import com.dishes.demo.model.request.user.RegistrationUserRequest;
import com.dishes.demo.utils.PasswordMatches;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, Object> {

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        if (obj instanceof RegistrationUserRequest request) {
            return request.getPassword().equals(request.getConfirmPassword());
        }
        if (obj instanceof ChangePasswordRequest request) {
            return request.getPassword().equals(request.getConfirmPassword());
        }
        return false;
    }
}