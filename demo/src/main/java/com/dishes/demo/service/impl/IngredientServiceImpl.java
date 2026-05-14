package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.IngredientMapper;
import com.dishes.demo.model.dto.ingredient.IngredientDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.IngredientRepository;
import com.dishes.demo.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientMapper ingredientMapper;

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<IngredientDTO>> getAllIngredients() {
        List<IngredientDTO> ingredients = ingredientRepository.findAll().stream()
                .map(ingredientMapper::toDto)
                .toList();

        return DishesResponse.createSuccessful(ingredients);
    }
}