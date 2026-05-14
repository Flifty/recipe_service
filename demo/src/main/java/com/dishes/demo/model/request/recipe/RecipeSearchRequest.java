package com.dishes.demo.model.request.recipe;

import com.dishes.demo.model.enums.RecipeSortField;
import com.dishes.demo.model.enums.SortDirection;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeSearchRequest {

    private String name;
    private String description;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private Long categoryId;
    private Long cuisineId;
    private Boolean deleted;

    private RecipeSortField sortField;
    private SortDirection sortDirection;
}