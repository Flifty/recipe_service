package com.dishes.demo.repository;

import com.dishes.demo.model.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByRecipeIdAndUserId(Long recipeId, Long userId);

    long countByRecipeId(Long recipeId);

    List<Rating> findByRecipeId(Long recipeId);
}