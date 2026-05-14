package com.dishes.demo.model.dto.recipe;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeIngredientDTO implements Serializable {

    private Long ingredientId;
    private String ingredientName;
    private String amount;
    private String unit;
}