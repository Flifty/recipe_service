package com.dishes.demo.repository;

import com.dishes.demo.model.entity.Recipe;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long>, JpaSpecificationExecutor<Recipe> {

    List<Recipe> findByNameContainingIgnoreCase(String name);

    @EntityGraph(attributePaths = {
            "category",
            "cuisine",
            "author",
            "recipeIngredients",
            "recipeIngredients.ingredient"
    })
    Optional<Recipe> findByIdAndDeletedFalse(Long id);

    @EntityGraph(attributePaths = {
            "category",
            "cuisine",
            "author"
    })
    List<Recipe> findByAuthorIdAndDeletedFalseOrderByIdDesc(Long authorId);
}