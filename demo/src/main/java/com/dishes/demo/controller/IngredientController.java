package com.dishes.demo.controller;

import com.dishes.demo.model.dto.ingredient.IngredientDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public ResponseEntity<DishesResponse<List<IngredientDTO>>> getAllIngredients() {
        return ResponseEntity.ok(ingredientService.getAllIngredients());
    }
}