package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.user.UserDTO;
import com.dishes.demo.model.dto.user.UserProfileDTO;
import com.dishes.demo.model.dto.user.UserSearchDTO;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.enums.RegistrationStatus;
import com.dishes.demo.model.request.user.NewUserRequest;
import com.dishes.demo.model.request.user.RegistrationUserRequest;
import com.dishes.demo.model.request.user.UpdateUserRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        imports = {RegistrationStatus.class}
)
public interface UserMapper {

    UserDTO toDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "created", ignore = true)
    @Mapping(target = "updated", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "registrationStatus", expression = "java(RegistrationStatus.ACTIVE)")
    @Mapping(target = "recipes", ignore = true)
    User createUser(NewUserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "created", ignore = true)
    @Mapping(target = "updated", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "registrationStatus", ignore = true)
    @Mapping(target = "recipes", ignore = true)
    void updateUser(@MappingTarget User user, UpdateUserRequest request);

    @Mapping(source = "deleted", target = "isDeleted")
    UserSearchDTO toUserSearchDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "created", ignore = true)
    @Mapping(target = "updated", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "registrationStatus", expression = "java(RegistrationStatus.ACTIVE)")
    @Mapping(target = "recipes", ignore = true)
    User fromRegistrationDto(RegistrationUserRequest request);

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "token", source = "token")
    @Mapping(target = "refreshToken", source = "refreshToken")
    UserProfileDTO toUserProfileDto(User user, String token, String refreshToken);
}