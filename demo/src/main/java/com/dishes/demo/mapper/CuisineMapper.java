package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.cuisine.CuisineDTO;
import com.dishes.demo.model.entity.Cuisine;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CuisineMapper {

    CuisineDTO toDto(Cuisine cuisine);
}