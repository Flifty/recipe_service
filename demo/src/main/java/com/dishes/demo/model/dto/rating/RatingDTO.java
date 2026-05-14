package com.dishes.demo.model.dto.rating;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RatingDTO implements Serializable {

    private Long id;
    private Integer value;

    private Long recipeId;
    private Long userId;
    private String username;
}