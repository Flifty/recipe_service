package com.dishes.demo.model.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDTO implements Serializable {

    private Long id;
    private String text;
    private LocalDateTime created;

    private Long recipeId;
    private Long userId;
    private String username;
}