package com.dishes.demo.controller;

import com.dishes.demo.model.dto.favorite.FavoriteDTO;
import com.dishes.demo.model.request.favorite.CreateFavoriteRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<DishesResponse<FavoriteDTO>> addToFavorites(
            @RequestBody CreateFavoriteRequest request
    ) {
        return ResponseEntity.ok(favoriteService.addToFavorites(request));
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<DishesResponse<String>> removeFromFavorites(
            @PathVariable Long recipeId
    ) {
        return ResponseEntity.ok(favoriteService.removeFromFavorites(recipeId));
    }

    @GetMapping("/my")
    public ResponseEntity<DishesResponse<List<FavoriteDTO>>> getMyFavorites() {
        return ResponseEntity.ok(favoriteService.getMyFavorites());
    }
}