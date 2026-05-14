package com.dishes.demo.model.request.recipe;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateRecipeRequest {

    private String name;
    private String description;
    private String instructions;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;
    private Long categoryId;
    private Long cuisineId;

    private List<RecipeIngredientRequest> ingredients;
}