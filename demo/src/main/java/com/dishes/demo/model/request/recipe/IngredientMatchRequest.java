package com.dishes.demo.model.request.recipe;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class IngredientMatchRequest implements Serializable {

    private List<String> ingredients;
}