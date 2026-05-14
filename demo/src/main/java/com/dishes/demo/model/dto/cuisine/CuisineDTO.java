package com.dishes.demo.model.dto.cuisine;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CuisineDTO implements Serializable {

    private Long id;
    private String name;
}