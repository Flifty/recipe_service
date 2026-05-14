package com.dishes.demo.controller;

import com.dishes.demo.model.dto.user.UserDTO;
import com.dishes.demo.model.dto.user.UserSearchDTO;
import com.dishes.demo.model.request.user.NewUserRequest;
import com.dishes.demo.model.request.user.UpdateUserRequest;
import com.dishes.demo.model.request.user.UserSearchRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.model.response.recipe.PaginationResponse;
import com.dishes.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<DishesResponse<UserDTO>> getUserById(
            @PathVariable(name = "id") Long userId) {
        DishesResponse<UserDTO> response = userService.getById(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<DishesResponse<UserDTO>> createUser(
            @RequestBody @Valid NewUserRequest request) {
        DishesResponse<UserDTO> createdUser = userService.createUser(request);
        return ResponseEntity.ok(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DishesResponse<UserDTO>> updateUserById(
            @PathVariable(name = "id") Long userId,
            @RequestBody @Valid UpdateUserRequest request) {
        DishesResponse<UserDTO> updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteUser(
            @PathVariable(name = "id") Long userId
    ) {
        userService.softDeleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<DishesResponse<PaginationResponse<UserSearchDTO>>> getAllUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("id").descending());
        DishesResponse<PaginationResponse<UserSearchDTO>> response = userService.findAllUsers(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    public ResponseEntity<DishesResponse<PaginationResponse<UserSearchDTO>>> searchUsers(
            @RequestBody @Valid UserSearchRequest request,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {

        Pageable pageable = PageRequest.of(page, limit);
        DishesResponse<PaginationResponse<UserSearchDTO>> response = userService.searchUsers(request, pageable);
        return ResponseEntity.ok(response);
    }
}