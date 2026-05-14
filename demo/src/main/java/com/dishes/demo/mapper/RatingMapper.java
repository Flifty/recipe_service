package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.rating.RatingDTO;
import com.dishes.demo.model.entity.Rating;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RatingMapper {

    @Mapping(target = "recipeId", source = "recipe.id")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    RatingDTO toDto(Rating rating);
}