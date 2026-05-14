package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.ingredient.IngredientDTO;
import com.dishes.demo.model.entity.Ingredient;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface IngredientMapper {

    IngredientDTO toDto(Ingredient ingredient);
}