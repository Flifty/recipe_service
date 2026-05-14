package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.UserMapper;
import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.model.dto.user.UserProfileDTO;
import com.dishes.demo.model.entity.RefreshToken;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.InvalidDataException;
import com.dishes.demo.model.exception.InvalidPasswordException;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.user.ChangePasswordRequest;
import com.dishes.demo.model.request.user.LoginRequest;
import com.dishes.demo.model.request.user.RegistrationUserRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.security.JwtTokenProvider;
import com.dishes.demo.service.AuthService;
import com.dishes.demo.service.RefreshTokenService;
import com.dishes.demo.utils.PasswordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public DishesResponse<UserProfileDTO> login(LoginRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new InvalidDataException(ApiErrorMessage.INVALID_USER_OR_PASSWORD.getMessage()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidDataException(ApiErrorMessage.INVALID_USER_OR_PASSWORD.getMessage());
        }

        String token = jwtTokenProvider.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.generateOrUpdateRefreshToken(user);

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        UserProfileDTO profileDTO = userMapper.toUserProfileDto(user, token, refreshToken.getToken());
        return DishesResponse.createSuccessful(profileDTO);
    }

    @Override
    @Transactional
    public DishesResponse<UserProfileDTO> register(RegistrationUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new InvalidDataException(ApiErrorMessage.USERNAME_ALREADY_EXISTS.getMessage(request.getUsername()));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidDataException(ApiErrorMessage.EMAIL_ALREADY_EXISTS.getMessage(request.getEmail()));
        }

        if (PasswordUtils.isNotValidPassword(request.getPassword())) {
            throw new InvalidPasswordException(ApiErrorMessage.INVALID_PASSWORD.getMessage());
        }

        User user = userMapper.fromRegistrationDto(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.generateOrUpdateRefreshToken(user);

        UserProfileDTO profileDTO = userMapper.toUserProfileDto(user, token, refreshToken.getToken());
        return DishesResponse.createSuccessful(profileDTO);
    }

    @Override
    @Transactional
    public DishesResponse<String> changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new NotFoundException(ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(email)));

        if (PasswordUtils.isNotValidPassword(request.getPassword())) {
            throw new InvalidPasswordException(ApiErrorMessage.INVALID_PASSWORD.getMessage());
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return DishesResponse.createSuccessful(ApiErrorMessage.PASSWORD_CHANGED_SUCCESSFULLY.getMessage());
    }

    @Override
    @Transactional
    public DishesResponse<UserProfileDTO> refreshToken(String requestRefreshToken) {
        RefreshToken refreshToken = refreshTokenService.validateAndRefreshToken(requestRefreshToken);
        User user = refreshToken.getUser();

        String token = jwtTokenProvider.generateToken(user);
        UserProfileDTO profileDTO = userMapper.toUserProfileDto(user, token, refreshToken.getToken());

        return DishesResponse.createSuccessful(profileDTO);
    }
}