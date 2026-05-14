package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.favorite.FavoriteDTO;
import com.dishes.demo.model.entity.Favorite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface FavoriteMapper {

    @Mapping(target = "recipeId", source = "recipe.id")
    @Mapping(target = "recipeName", source = "recipe.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    FavoriteDTO toDto(Favorite favorite);
}