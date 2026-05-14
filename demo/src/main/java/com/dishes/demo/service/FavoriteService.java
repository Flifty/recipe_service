package com.dishes.demo.service;

import com.dishes.demo.model.dto.favorite.FavoriteDTO;
import com.dishes.demo.model.request.favorite.CreateFavoriteRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;

import java.util.List;

public interface FavoriteService {

    DishesResponse<FavoriteDTO> addToFavorites(CreateFavoriteRequest request);

    DishesResponse<String> removeFromFavorites(Long recipeId);

    DishesResponse<List<FavoriteDTO>> getMyFavorites();
}