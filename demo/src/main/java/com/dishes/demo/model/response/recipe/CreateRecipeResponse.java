package com.dishes.demo.model.response.recipe;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRecipeResponse {

    private Long id;
    private String name;
    private String description;
    private String instructions;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;
    private String categoryName;
    private String cuisineName;
}