package com.dishes.demo.service;

import com.dishes.demo.model.dto.user.UserProfileDTO;
import com.dishes.demo.model.request.user.ChangePasswordRequest;
import com.dishes.demo.model.request.user.LoginRequest;
import com.dishes.demo.model.request.user.RegistrationUserRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;

public interface AuthService {

    DishesResponse<UserProfileDTO> login(LoginRequest request);

    DishesResponse<UserProfileDTO> register(RegistrationUserRequest request);

    DishesResponse<String> changePassword(String email, ChangePasswordRequest request);

    DishesResponse<UserProfileDTO> refreshToken(String refreshToken);
}