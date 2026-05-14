package com.dishes.demo.model.request.review;

import lombok.Data;

import java.io.Serializable;

@Data
public class CreateReviewRequest implements Serializable {

    private Long recipeId;
    private String text;
}