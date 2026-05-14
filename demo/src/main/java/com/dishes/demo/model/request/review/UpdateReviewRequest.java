package com.dishes.demo.model.request.review;

import lombok.Data;

import java.io.Serializable;

@Data
public class UpdateReviewRequest implements Serializable {

    private String text;
}