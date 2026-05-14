package com.dishes.demo.service;

import com.dishes.demo.model.dto.cuisine.CuisineDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;

import java.util.List;

public interface CuisineService {

    DishesResponse<List<CuisineDTO>> getAllCuisines();
}