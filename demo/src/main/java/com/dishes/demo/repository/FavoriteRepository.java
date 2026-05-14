package com.dishes.demo.repository;

import com.dishes.demo.model.entity.Favorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByRecipeIdAndUserId(Long recipeId, Long userId);

    @EntityGraph(attributePaths = {"recipe", "user"})
    List<Favorite> findByUserId(Long userId);

    boolean existsByRecipeIdAndUserId(Long recipeId, Long userId);
}