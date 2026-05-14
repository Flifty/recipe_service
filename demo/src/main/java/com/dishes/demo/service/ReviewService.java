package com.dishes.demo.service;

import com.dishes.demo.model.dto.review.ReviewDTO;
import com.dishes.demo.model.request.review.CreateReviewRequest;
import com.dishes.demo.model.request.review.UpdateReviewRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;

import java.util.List;

public interface ReviewService {

    DishesResponse<ReviewDTO> createReview(CreateReviewRequest request);

    DishesResponse<List<ReviewDTO>> getReviewsByRecipeId(Long recipeId);

    DishesResponse<ReviewDTO> updateReview(Long reviewId, UpdateReviewRequest request);

    DishesResponse<String> deleteReview(Long reviewId);
}