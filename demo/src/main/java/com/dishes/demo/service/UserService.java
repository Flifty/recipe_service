package com.dishes.demo.service;

import com.dishes.demo.model.dto.user.UserDTO;
import com.dishes.demo.model.dto.user.UserSearchDTO;
import com.dishes.demo.model.request.user.NewUserRequest;
import com.dishes.demo.model.request.user.UpdateUserRequest;
import com.dishes.demo.model.request.user.UserSearchRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.model.response.recipe.PaginationResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Pageable;

public interface UserService {

    DishesResponse<UserDTO> getById(@NotNull Long userId);

    DishesResponse<UserDTO> createUser(@NotNull NewUserRequest request);

    DishesResponse<UserDTO> updateUser(@NotNull Long userId, @NotNull UpdateUserRequest request);

    void softDeleteUser(Long userId);

    DishesResponse<PaginationResponse<UserSearchDTO>> findAllUsers(Pageable pageable);

    DishesResponse<PaginationResponse<UserSearchDTO>> searchUsers(UserSearchRequest request, Pageable pageable);
}