package com.dishes.demo.controller;

import com.dishes.demo.model.dto.rating.RatingDTO;
import com.dishes.demo.model.dto.rating.RecipeRatingSummaryDTO;
import com.dishes.demo.model.request.rating.CreateRatingRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ratings")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<DishesResponse<RatingDTO>> createOrUpdateRating(
            @RequestBody CreateRatingRequest request
    ) {
        return ResponseEntity.ok(ratingService.createOrUpdateRating(request));
    }

    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<DishesResponse<RecipeRatingSummaryDTO>> getRecipeRatingSummary(
            @PathVariable Long recipeId
    ) {
        return ResponseEntity.ok(ratingService.getRecipeRatingSummary(recipeId));
    }
}