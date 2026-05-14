package com.dishes.demo.service;

import com.dishes.demo.model.dto.ingredient.IngredientDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;

import java.util.List;

public interface IngredientService {

    DishesResponse<List<IngredientDTO>> getAllIngredients();
}