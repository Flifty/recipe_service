package com.dishes.demo.controller;

import com.dishes.demo.model.dto.recipe.RecipeDTO;
import com.dishes.demo.model.dto.recipe.RecipeSearchDTO;
import com.dishes.demo.model.request.recipe.CreateRecipeRequest;
import com.dishes.demo.model.request.recipe.IngredientMatchRequest;
import com.dishes.demo.model.request.recipe.RecipeSearchRequest;
import com.dishes.demo.model.request.recipe.UpdateRecipeRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.model.response.recipe.IngredientMatchResponse;
import com.dishes.demo.model.response.recipe.PaginationResponse;
import com.dishes.demo.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping("/{id}")
    public ResponseEntity<DishesResponse<RecipeDTO>> getRecipeById(
            @PathVariable(name = "id") Long recipeId) {
        DishesResponse<RecipeDTO> response = recipeService.getById(recipeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<DishesResponse<RecipeDTO>> createRecipe(
            @RequestBody @Valid CreateRecipeRequest request) {
        DishesResponse<RecipeDTO> createdRecipe = recipeService.createRecipe(request);
        return ResponseEntity.ok(createdRecipe);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DishesResponse<RecipeDTO>> updateRecipeById(
            @PathVariable(name = "id") Long recipeId,
            @RequestBody @Valid UpdateRecipeRequest request) {
        DishesResponse<RecipeDTO> updatedRecipe = recipeService.updateRecipe(recipeId, request);
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteRecipe(
            @PathVariable(name = "id") Long recipeId
    ) {
        recipeService.softDeleteRecipe(recipeId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<DishesResponse<PaginationResponse<RecipeSearchDTO>>> getAllRecipes(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("id").descending());
        DishesResponse<PaginationResponse<RecipeSearchDTO>> response = recipeService.findAllRecipes(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    public ResponseEntity<DishesResponse<PaginationResponse<RecipeSearchDTO>>> searchRecipes(
            @RequestBody @Valid RecipeSearchRequest request,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {

        Pageable pageable = PageRequest.of(page, limit);
        DishesResponse<PaginationResponse<RecipeSearchDTO>> response = recipeService.searchRecipes(request, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/match")
    public ResponseEntity<DishesResponse<List<IngredientMatchResponse>>> matchRecipesByIngredients(
            @RequestBody IngredientMatchRequest request
    ) {
        DishesResponse<List<IngredientMatchResponse>> response = recipeService.matchRecipesByIngredients(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<DishesResponse<List<RecipeSearchDTO>>> getMyRecipes() {
        return ResponseEntity.ok(recipeService.getMyRecipes());
    }
}