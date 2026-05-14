package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.CategoryMapper;
import com.dishes.demo.model.dto.category.CategoryDTO;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.CategoryRepository;
import com.dishes.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .toList();

        return DishesResponse.createSuccessful(categories);
    }
}