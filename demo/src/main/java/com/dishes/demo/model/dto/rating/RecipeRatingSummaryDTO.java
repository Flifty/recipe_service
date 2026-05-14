package com.dishes.demo.model.dto.rating;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeRatingSummaryDTO implements Serializable {

    private Long recipeId;
    private Double averageRating;
    private Long ratingsCount;
}