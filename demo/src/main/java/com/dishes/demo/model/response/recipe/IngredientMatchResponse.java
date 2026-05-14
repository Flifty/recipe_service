package com.dishes.demo.model.response.recipe;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class IngredientMatchResponse implements Serializable {

    private Long recipeId;
    private String recipeName;

    private int totalIngredients;
    private int matchedIngredients;
    private int missingIngredientsCount;

    private List<String> missingIngredients;

    private String categoryName;
    private String cuisineName;
}