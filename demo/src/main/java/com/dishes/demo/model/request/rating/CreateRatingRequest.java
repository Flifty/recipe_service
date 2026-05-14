package com.dishes.demo.model.request.rating;

import lombok.Data;

import java.io.Serializable;

@Data
public class CreateRatingRequest implements Serializable {

    private Long recipeId;
    private Integer value;
}