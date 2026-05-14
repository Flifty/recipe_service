package com.dishes.demo.service;

import com.dishes.demo.model.dto.category.CategoryDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;

import java.util.List;

public interface CategoryService {

    DishesResponse<List<CategoryDTO>> getAllCategories();
}