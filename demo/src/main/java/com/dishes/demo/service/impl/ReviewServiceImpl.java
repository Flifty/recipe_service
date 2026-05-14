package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.ReviewMapper;
import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.model.dto.review.ReviewDTO;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.Review;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.review.CreateReviewRequest;
import com.dishes.demo.model.request.review.UpdateReviewRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.RecipeRepository;
import com.dishes.demo.repository.ReviewRepository;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.service.ReviewService;
import com.dishes.demo.utils.ApiUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final ApiUtils apiUtils;

    @Override
    @Transactional
    public DishesResponse<ReviewDTO> createReview(CreateReviewRequest request) {
        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(request.getRecipeId())
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(request.getRecipeId())
                ));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        Review review = new Review();
        review.setText(request.getText());
        review.setRecipe(recipe);
        review.setUser(user);

        Review savedReview = reviewRepository.save(review);

        return DishesResponse.createSuccessful(reviewMapper.toDto(savedReview));
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<ReviewDTO>> getReviewsByRecipeId(Long recipeId) {
        List<ReviewDTO> reviews = reviewRepository.findByRecipeIdAndDeletedFalseOrderByCreatedDesc(recipeId)
                .stream()
                .map(reviewMapper::toDto)
                .toList();

        return DishesResponse.createSuccessful(reviews);
    }

    @Override
    @Transactional
    public DishesResponse<ReviewDTO> updateReview(Long reviewId, UpdateReviewRequest request) {
        Review review = reviewRepository.findByIdAndDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("Review was not found"));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("You can edit only your own review");
        }

        review.setText(request.getText());
        Review savedReview = reviewRepository.save(review);

        return DishesResponse.createSuccessful(reviewMapper.toDto(savedReview));
    }

    @Override
    @Transactional
    public DishesResponse<String> deleteReview(Long reviewId) {
        Review review = reviewRepository.findByIdAndDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("Review was not found"));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("You can delete only your own review");
        }

        review.setDeleted(true);
        reviewRepository.save(review);

        return DishesResponse.createSuccessful("Review deleted successfully");
    }
}