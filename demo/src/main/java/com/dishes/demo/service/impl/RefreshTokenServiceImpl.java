package com.dishes.demo.service.impl;

import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.model.entity.RefreshToken;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.repository.RefreshTokenRepository;
import com.dishes.demo.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public RefreshToken generateOrUpdateRefreshToken(User user) {
        return refreshTokenRepository.findByUserId(user.getId())
                .map(refreshToken -> {
                    refreshToken.setCreated(LocalDateTime.now());
                    refreshToken.setToken(UUID.randomUUID().toString().replace("-", ""));
                    return refreshTokenRepository.save(refreshToken);
                })
                .orElseGet(() -> {
                    RefreshToken newToken = new RefreshToken();
                    newToken.setUser(user);
                    newToken.setCreated(LocalDateTime.now());
                    newToken.setToken(UUID.randomUUID().toString().replace("-", ""));
                    return refreshTokenRepository.save(newToken);
                });
    }

    @Override
    @Transactional
    public RefreshToken validateAndRefreshToken(String requestRefreshToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestRefreshToken)
                .orElseThrow(() -> new NotFoundException(ApiErrorMessage.NOT_FOUND_REFRESH_TOKEN.getMessage()));

        refreshToken.setCreated(LocalDateTime.now());
        refreshToken.setToken(UUID.randomUUID().toString().replace("-", ""));
        return refreshTokenRepository.save(refreshToken);
    }
}