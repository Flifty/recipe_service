package com.dishes.demo.controller;

import com.dishes.demo.model.dto.cuisine.CuisineDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.service.CuisineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cuisines")
public class CuisineController {

    private final CuisineService cuisineService;

    @GetMapping
    public ResponseEntity<DishesResponse<List<CuisineDTO>>> getAllCuisines() {
        return ResponseEntity.ok(cuisineService.getAllCuisines());
    }
}