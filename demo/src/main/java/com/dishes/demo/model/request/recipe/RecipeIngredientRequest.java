package com.dishes.demo.model.request.recipe;

import lombok.Data;

import java.io.Serializable;

@Data
public class RecipeIngredientRequest implements Serializable {

    private Long ingredientId;
    private String amount;
    private String unit;
}