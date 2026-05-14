package com.dishes.demo.model.dto.favorite;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteDTO implements Serializable {

    private Long id;
    private Long recipeId;
    private String recipeName;
    private Long userId;
    private String username;
}