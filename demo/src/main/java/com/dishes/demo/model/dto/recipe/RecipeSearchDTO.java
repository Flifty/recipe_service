package com.dishes.demo.model.dto.recipe;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class RecipeSearchDTO implements Serializable {

    private Long id;
    private String name;
    private String description;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;
    private String categoryName;
    private String cuisineName;
    private Boolean deleted;
    private LocalDateTime createdAt;

    private Double averageRating;
    private Long ratingsCount;
    private Long reviewsCount;

    private Integer myRating;
    private Boolean isFavorite;
}