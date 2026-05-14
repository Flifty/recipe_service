package com.dishes.demo.model.response.recipe;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DishesResponse<P> implements Serializable {

    private String message;
    private P payload;
    private boolean success;

    public static <P> DishesResponse<P> createSuccessful(P payload) {
        return new DishesResponse<>("", payload, true);
    }

    public static <P> DishesResponse<P> createFailed(String message) {
        return new DishesResponse<>(message, null, false);
    }
}