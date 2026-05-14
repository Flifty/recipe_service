package com.dishes.demo.service;

import com.dishes.demo.model.dto.rating.RatingDTO;
import com.dishes.demo.model.dto.rating.RecipeRatingSummaryDTO;
import com.dishes.demo.model.request.rating.CreateRatingRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;

public interface RatingService {

    DishesResponse<RatingDTO> createOrUpdateRating(CreateRatingRequest request);

    DishesResponse<RecipeRatingSummaryDTO> getRecipeRatingSummary(Long recipeId);
}