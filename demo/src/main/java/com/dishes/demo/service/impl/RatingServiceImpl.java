package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.RatingMapper;
import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.model.dto.rating.RatingDTO;
import com.dishes.demo.model.dto.rating.RecipeRatingSummaryDTO;
import com.dishes.demo.model.entity.Rating;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.InvalidDataException;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.rating.CreateRatingRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.RatingRepository;
import com.dishes.demo.repository.RecipeRepository;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.service.RatingService;
import com.dishes.demo.utils.ApiUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RatingMapper ratingMapper;
    private final ApiUtils apiUtils;

    @Override
    @Transactional
    public DishesResponse<RatingDTO> createOrUpdateRating(CreateRatingRequest request) {
        if (request.getValue() == null || request.getValue() < 1 || request.getValue() > 5) {
            throw new InvalidDataException("Rating must be between 1 and 5");
        }

        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(request.getRecipeId())
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(request.getRecipeId())
                ));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        Rating rating = ratingRepository.findByRecipeIdAndUserId(recipe.getId(), user.getId())
                .orElseGet(() -> {
                    Rating newRating = new Rating();
                    newRating.setRecipe(recipe);
                    newRating.setUser(user);
                    return newRating;
                });

        rating.setValue(request.getValue());

        Rating savedRating = ratingRepository.save(rating);
        return DishesResponse.createSuccessful(ratingMapper.toDto(savedRating));
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<RecipeRatingSummaryDTO> getRecipeRatingSummary(Long recipeId) {
        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(recipeId)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(recipeId)
                ));

        double average = ratingRepository.findAll().stream()
                .filter(rating -> rating.getRecipe().getId().equals(recipe.getId()))
                .mapToInt(Rating::getValue)
                .average()
                .orElse(0.0);

        long count = ratingRepository.countByRecipeId(recipe.getId());

        RecipeRatingSummaryDTO summaryDTO = new RecipeRatingSummaryDTO(
                recipe.getId(),
                Math.round(average * 100.0) / 100.0,
                count
        );

        return DishesResponse.createSuccessful(summaryDTO);
    }
}