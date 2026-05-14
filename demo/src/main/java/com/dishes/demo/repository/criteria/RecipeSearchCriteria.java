package com.dishes.demo.repository.criteria;

import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.request.recipe.RecipeSearchRequest;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
public class RecipeSearchCriteria implements Specification<Recipe> {

    private final RecipeSearchRequest request;

    @Override
    public Predicate toPredicate(
            @NonNull Root<Recipe> root,
            CriteriaQuery<?> query,
            @NonNull CriteriaBuilder criteriaBuilder) {

        List<Predicate> predicates = new ArrayList<>();

        if (Objects.nonNull(request.getName()) && !request.getName().isBlank()) {
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(Recipe.NAME_FIELD)),
                    "%" + request.getName().toLowerCase() + "%"
            ));
        }

        if (Objects.nonNull(request.getDescription()) && !request.getDescription().isBlank()) {
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(Recipe.DESCRIPTION_FIELD)),
                    "%" + request.getDescription().toLowerCase() + "%"
            ));
        }

        if (Objects.nonNull(request.getCookingTimeMinutes())) {
            predicates.add(criteriaBuilder.equal(
                    root.get(Recipe.COOKING_TIME_FIELD),
                    request.getCookingTimeMinutes()
            ));
        }

        if (Objects.nonNull(request.getServings())) {
            predicates.add(criteriaBuilder.equal(
                    root.get(Recipe.SERVINGS_FIELD),
                    request.getServings()
            ));
        }

        if (Objects.nonNull(request.getCategoryId())) {
            predicates.add(criteriaBuilder.equal(
                    root.get("category").get("id"),
                    request.getCategoryId()
            ));
        }

        if (Objects.nonNull(request.getCuisineId())) {
            predicates.add(criteriaBuilder.equal(
                    root.get("cuisine").get("id"),
                    request.getCuisineId()
            ));
        }

        if (Objects.nonNull(request.getDeleted())) {
            predicates.add(criteriaBuilder.equal(
                    root.get(Recipe.DELETED_FIELD),
                    request.getDeleted()
            ));
        }

        query.orderBy(criteriaBuilder.desc(root.get(Recipe.ID_FIELD)));

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    }
}