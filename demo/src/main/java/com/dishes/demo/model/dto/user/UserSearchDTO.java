package com.dishes.demo.model.dto.user;

import com.dishes.demo.model.enums.RegistrationStatus;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class UserSearchDTO implements Serializable {

    private Long id;
    private String username;
    private String email;
    private LocalDateTime created;
    private Boolean isDeleted;
    private RegistrationStatus registrationStatus;
}