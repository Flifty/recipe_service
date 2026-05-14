package com.dishes.demo.model.request.favorite;

import lombok.Data;

import java.io.Serializable;

@Data
public class CreateFavoriteRequest implements Serializable {

    private Long recipeId;
}