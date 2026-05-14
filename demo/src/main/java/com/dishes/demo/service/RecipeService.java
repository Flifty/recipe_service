package com.dishes.demo.service;

import com.dishes.demo.model.dto.recipe.RecipeDTO;
import com.dishes.demo.model.dto.recipe.RecipeSearchDTO;
import com.dishes.demo.model.request.recipe.CreateRecipeRequest;
import com.dishes.demo.model.request.recipe.IngredientMatchRequest;
import com.dishes.demo.model.request.recipe.RecipeSearchRequest;
import com.dishes.demo.model.request.recipe.UpdateRecipeRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.model.response.recipe.IngredientMatchResponse;
import com.dishes.demo.model.response.recipe.PaginationResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecipeService {

    DishesResponse<RecipeDTO> getById(@NotNull Long recipeId);

    DishesResponse<RecipeDTO> createRecipe(@NotNull CreateRecipeRequest request);

    DishesResponse<RecipeDTO> updateRecipe(@NotNull Long recipeId, @NotNull UpdateRecipeRequest request);

    void softDeleteRecipe(Long recipeId);

    DishesResponse<PaginationResponse<RecipeSearchDTO>> findAllRecipes(Pageable pageable);

    DishesResponse<PaginationResponse<RecipeSearchDTO>> searchRecipes(RecipeSearchRequest request, Pageable pageable);

    DishesResponse<List<IngredientMatchResponse>> matchRecipesByIngredients(IngredientMatchRequest request);

    DishesResponse<List<RecipeSearchDTO>> getMyRecipes();
}