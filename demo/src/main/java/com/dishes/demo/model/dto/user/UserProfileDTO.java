package com.dishes.demo.model.dto.user;

import com.dishes.demo.model.enums.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileDTO implements Serializable {

    private Long id;
    private String username;
    private String email;
    private RegistrationStatus registrationStatus;
    private LocalDateTime lastLogin;

    private String token;
    private String refreshToken;
}