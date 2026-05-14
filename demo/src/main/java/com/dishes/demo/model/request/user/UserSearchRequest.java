package com.dishes.demo.model.request.user;

import com.dishes.demo.model.enums.RegistrationStatus;
import com.dishes.demo.model.enums.UserSortField;
import lombok.Data;

import java.io.Serializable;

@Data
public class UserSearchRequest implements Serializable {

    private String username;
    private String email;
    private Boolean deleted;
    private RegistrationStatus registrationStatus;
    private String keyword;
    private UserSortField sortField;
}