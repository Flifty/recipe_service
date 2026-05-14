package com.dishes.demo.controller;

import com.dishes.demo.model.dto.review.ReviewDTO;
import com.dishes.demo.model.request.review.CreateReviewRequest;
import com.dishes.demo.model.request.review.UpdateReviewRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<DishesResponse<ReviewDTO>> createReview(
            @RequestBody CreateReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }

    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<DishesResponse<List<ReviewDTO>>> getReviewsByRecipeId(
            @PathVariable Long recipeId
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByRecipeId(recipeId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<DishesResponse<ReviewDTO>> updateReview(
            @PathVariable Long reviewId,
            @RequestBody UpdateReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<DishesResponse<String>> deleteReview(
            @PathVariable Long reviewId
    ) {
        return ResponseEntity.ok(reviewService.deleteReview(reviewId));
    }
}