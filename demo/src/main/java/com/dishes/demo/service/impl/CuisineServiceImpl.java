package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.CuisineMapper;
import com.dishes.demo.model.dto.cuisine.CuisineDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.CuisineRepository;
import com.dishes.demo.service.CuisineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CuisineServiceImpl implements CuisineService {

    private final CuisineRepository cuisineRepository;
    private final CuisineMapper cuisineMapper;

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<CuisineDTO>> getAllCuisines() {
        List<CuisineDTO> cuisines = cuisineRepository.findAll().stream()
                .map(cuisineMapper::toDto)
                .toList();

        return DishesResponse.createSuccessful(cuisines);
    }
}