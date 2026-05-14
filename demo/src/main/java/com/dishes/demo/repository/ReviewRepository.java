package com.dishes.demo.repository;

import com.dishes.demo.model.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"user", "recipe"})
    List<Review> findByRecipeIdAndDeletedFalseOrderByCreatedDesc(Long recipeId);

    @EntityGraph(attributePaths = {"user", "recipe"})
    Optional<Review> findByIdAndDeletedFalse(Long id);

    long countByRecipeIdAndDeletedFalse(Long recipeId);
}