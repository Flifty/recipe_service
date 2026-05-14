package com.dishes.demo.mapper;

import com.dishes.demo.model.dto.recipe.RecipeDTO;
import com.dishes.demo.model.dto.recipe.RecipeIngredientDTO;
import com.dishes.demo.model.dto.recipe.RecipeSearchDTO;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.RecipeIngredient;
import com.dishes.demo.model.request.recipe.CreateRecipeRequest;
import com.dishes.demo.model.request.recipe.UpdateRecipeRequest;
import com.dishes.demo.model.response.recipe.CreateRecipeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface RecipeMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "cuisineId", source = "cuisine.id")
    @Mapping(target = "cuisineName", source = "cuisine.name")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorUsername", source = "author.username")
    @Mapping(target = "ingredients", source = "recipeIngredients")
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "ratingsCount", ignore = true)
    @Mapping(target = "reviewsCount", ignore = true)
    @Mapping(target = "myRating", ignore = true)
    @Mapping(target = "isFavorite", ignore = true)
    RecipeDTO toDto(Recipe recipe);

    @Mapping(target = "ingredientId", source = "ingredient.id")
    @Mapping(target = "ingredientName", source = "ingredient.name")
    RecipeIngredientDTO toIngredientDto(RecipeIngredient recipeIngredient);

    List<RecipeIngredientDTO> toIngredientDtoList(List<RecipeIngredient> recipeIngredients);

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "cuisineName", source = "cuisine.name")
    CreateRecipeResponse toResponse(Recipe recipe);

    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "cuisineName", source = "cuisine.name")
    @Mapping(target = "deleted", source = "deleted")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "ratingsCount", ignore = true)
    @Mapping(target = "reviewsCount", ignore = true)
    @Mapping(target = "myRating", ignore = true)
    @Mapping(target = "isFavorite", ignore = true)
    RecipeSearchDTO toSearchDto(Recipe recipe);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "cuisine", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "recipeIngredients", ignore = true)
    Recipe createRecipe(CreateRecipeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "cuisine", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "recipeIngredients", ignore = true)
    void updateRecipe(@org.mapstruct.MappingTarget Recipe recipe, UpdateRecipeRequest request);
}