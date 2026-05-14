package com.dishes.demo.controller;

import com.dishes.demo.model.dto.user.UserProfileDTO;
import com.dishes.demo.model.request.user.ChangePasswordRequest;
import com.dishes.demo.model.request.user.LoginRequest;
import com.dishes.demo.model.request.user.RegistrationUserRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<DishesResponse<UserProfileDTO>> login(
            @RequestBody @Valid LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<DishesResponse<UserProfileDTO>> register(
            @RequestBody @Valid RegistrationUserRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<DishesResponse<UserProfileDTO>> refreshToken(
            @RequestParam("refreshToken") String refreshToken
    ) {
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping("/change-password")
    public ResponseEntity<DishesResponse<String>> changePassword(
            Authentication authentication,
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(authService.changePassword(authentication.getName(), request));
    }
}