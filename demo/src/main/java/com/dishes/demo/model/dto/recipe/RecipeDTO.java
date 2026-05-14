package com.dishes.demo.model.dto.recipe;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeDTO implements Serializable {

    private Long id;
    private String name;
    private String description;
    private String instructions;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;

    private Long categoryId;
    private String categoryName;

    private Long cuisineId;
    private String cuisineName;

    private Long authorId;
    private String authorUsername;

    private List<RecipeIngredientDTO> ingredients;

    private Double averageRating;
    private Long ratingsCount;
    private Long reviewsCount;

    private Integer myRating;
    private Boolean isFavorite;
}