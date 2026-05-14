package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.UserMapper;
import com.dishes.demo.model.dto.user.UserProfileDTO;
import com.dishes.demo.model.entity.RefreshToken;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.enums.RegistrationStatus;
import com.dishes.demo.model.exception.InvalidDataException;
import com.dishes.demo.model.exception.InvalidPasswordException;
import com.dishes.demo.model.request.user.LoginRequest;
import com.dishes.demo.model.request.user.RegistrationUserRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.security.JwtTokenProvider;
import com.dishes.demo.service.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerShouldCreateUserAndReturnProfile() {
        RegistrationUserRequest request = new RegistrationUserRequest(
                "ivan",
                "ivan@mail.com",
                "Strong123",
                "Strong123"
        );

        User user = createUser(1L, "ivan", "ivan@mail.com");
        User savedUser = createUser(1L, "ivan", "ivan@mail.com");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        refreshToken.setUser(savedUser);

        UserProfileDTO profileDTO = new UserProfileDTO(
                1L,
                "ivan",
                "ivan@mail.com",
                RegistrationStatus.ACTIVE,
                null,
                "jwt-token",
                "refresh-token"
        );

        when(userRepository.existsByUsername("ivan")).thenReturn(false);
        when(userRepository.existsByEmail("ivan@mail.com")).thenReturn(false);
        when(userMapper.fromRegistrationDto(request)).thenReturn(user);
        when(passwordEncoder.encode("Strong123")).thenReturn("encoded-password");
        when(userRepository.save(user)).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken(savedUser)).thenReturn("jwt-token");
        when(refreshTokenService.generateOrUpdateRefreshToken(savedUser)).thenReturn(refreshToken);
        when(userMapper.toUserProfileDto(savedUser, "jwt-token", "refresh-token")).thenReturn(profileDTO);

        DishesResponse<UserProfileDTO> response = authService.register(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getEmail()).isEqualTo("ivan@mail.com");
        assertThat(response.getPayload().getToken()).isEqualTo("jwt-token");

        verify(userRepository).save(user);
        verify(passwordEncoder).encode("Strong123");
    }

    @Test
    void registerShouldThrowExceptionWhenEmailAlreadyExists() {
        RegistrationUserRequest request = new RegistrationUserRequest(
                "ivan",
                "ivan@mail.com",
                "Strong123",
                "Strong123"
        );

        when(userRepository.existsByUsername("ivan")).thenReturn(false);
        when(userRepository.existsByEmail("ivan@mail.com")).thenReturn(true);

        assertThrows(InvalidDataException.class, () -> authService.register(request));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerShouldThrowExceptionWhenPasswordIsWeak() {
        RegistrationUserRequest request = new RegistrationUserRequest(
                "ivan",
                "ivan@mail.com",
                "123",
                "123"
        );

        when(userRepository.existsByUsername("ivan")).thenReturn(false);
        when(userRepository.existsByEmail("ivan@mail.com")).thenReturn(false);

        assertThrows(InvalidPasswordException.class, () -> authService.register(request));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginShouldReturnProfileWhenCredentialsAreCorrect() {
        LoginRequest request = new LoginRequest("ivan@mail.com", "Strong123");

        User user = createUser(1L, "ivan", "ivan@mail.com");
        user.setPassword("encoded-password");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token");
        refreshToken.setUser(user);

        UserProfileDTO profileDTO = new UserProfileDTO(
                1L,
                "ivan",
                "ivan@mail.com",
                RegistrationStatus.ACTIVE,
                LocalDateTime.now(),
                "jwt-token",
                "refresh-token"
        );

        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Strong123", "encoded-password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(user)).thenReturn("jwt-token");
        when(refreshTokenService.generateOrUpdateRefreshToken(user)).thenReturn(refreshToken);
        when(userRepository.save(user)).thenReturn(user);
        when(userMapper.toUserProfileDto(user, "jwt-token", "refresh-token")).thenReturn(profileDTO);

        DishesResponse<UserProfileDTO> response = authService.login(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getToken()).isEqualTo("jwt-token");

        verify(userRepository).save(user);
    }

    @Test
    void loginShouldThrowExceptionWhenPasswordIsInvalid() {
        LoginRequest request = new LoginRequest("ivan@mail.com", "wrong-password");

        User user = createUser(1L, "ivan", "ivan@mail.com");
        user.setPassword("encoded-password");

        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThrows(InvalidDataException.class, () -> authService.login(request));

        verify(jwtTokenProvider, never()).generateToken(any(User.class));
    }

    private User createUser(Long id, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setDeleted(false);
        user.setActive(true);
        user.setRegistrationStatus(RegistrationStatus.ACTIVE);
        return user;
    }
}