package com.dishes.demo.service;

import com.dishes.demo.model.entity.RefreshToken;
import com.dishes.demo.model.entity.User;

public interface RefreshTokenService {

    RefreshToken generateOrUpdateRefreshToken(User user);

    RefreshToken validateAndRefreshToken(String refreshToken);
}