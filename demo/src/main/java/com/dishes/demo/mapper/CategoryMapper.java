package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.category.CategoryDTO;
import com.dishes.demo.model.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CategoryMapper {

    CategoryDTO toDto(Category category);
}