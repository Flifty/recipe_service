package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.FavoriteMapper;
import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.model.dto.favorite.FavoriteDTO;
import com.dishes.demo.model.entity.Favorite;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.DataExistException;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.favorite.CreateFavoriteRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.FavoriteRepository;
import com.dishes.demo.repository.RecipeRepository;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.service.FavoriteService;
import com.dishes.demo.utils.ApiUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final FavoriteMapper favoriteMapper;
    private final ApiUtils apiUtils;

    @Override
    @Transactional
    public DishesResponse<FavoriteDTO> addToFavorites(CreateFavoriteRequest request) {
        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(request.getRecipeId())
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(request.getRecipeId())
                ));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        favoriteRepository.findByRecipeIdAndUserId(recipe.getId(), user.getId())
                .ifPresent(existing -> {
                    throw new DataExistException("Recipe is already in favorites");
                });

        Favorite favorite = new Favorite();
        favorite.setRecipe(recipe);
        favorite.setUser(user);

        Favorite savedFavorite = favoriteRepository.save(favorite);

        return DishesResponse.createSuccessful(favoriteMapper.toDto(savedFavorite));
    }

    @Override
    @Transactional
    public DishesResponse<String> removeFromFavorites(Long recipeId) {
        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        Favorite favorite = favoriteRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElseThrow(() -> new NotFoundException("Favorite recipe was not found"));

        favoriteRepository.delete(favorite);

        return DishesResponse.createSuccessful("Recipe removed from favorites");
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<FavoriteDTO>> getMyFavorites() {
        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        List<FavoriteDTO> favorites = favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(favoriteMapper::toDto)
                .toList();

        return DishesResponse.createSuccessful(favorites);
    }
}