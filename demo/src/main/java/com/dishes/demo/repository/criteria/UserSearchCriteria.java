package com.dishes.demo.repository.criteria;

import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.request.user.UserSearchRequest;
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
public class UserSearchCriteria implements Specification<User> {

    private final UserSearchRequest request;

    @Override
    public Predicate toPredicate(
            @NonNull Root<User> root,
            CriteriaQuery<?> query,
            @NonNull CriteriaBuilder criteriaBuilder) {

        List<Predicate> predicates = new ArrayList<>();

        if (Objects.nonNull(request.getUsername()) && !request.getUsername().isBlank()) {
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(User.USERNAME_FIELD)),
                    "%" + request.getUsername().toLowerCase() + "%"
            ));
        }

        if (Objects.nonNull(request.getEmail()) && !request.getEmail().isBlank()) {
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(User.EMAIL_FIELD)),
                    "%" + request.getEmail().toLowerCase() + "%"
            ));
        }

        if (Objects.nonNull(request.getDeleted())) {
            predicates.add(criteriaBuilder.equal(
                    root.get(User.DELETED_FIELD),
                    request.getDeleted()
            ));
        }

        if (Objects.nonNull(request.getRegistrationStatus())) {
            predicates.add(criteriaBuilder.equal(
                    root.get("registrationStatus"),
                    request.getRegistrationStatus()
            ));
        }

        if (Objects.nonNull(request.getKeyword()) && !request.getKeyword().isBlank()) {
            String keyword = "%" + request.getKeyword().toLowerCase() + "%";

            Predicate usernamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(User.USERNAME_FIELD)),
                    keyword
            );

            Predicate emailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get(User.EMAIL_FIELD)),
                    keyword
            );

            predicates.add(criteriaBuilder.or(usernamePredicate, emailPredicate));
        }

        sort(root, criteriaBuilder, query);

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    }

    private void sort(Root<User> root, CriteriaBuilder criteriaBuilder, CriteriaQuery<?> query) {
        if (Objects.nonNull(request.getSortField())) {
            switch (request.getSortField()) {
                case USERNAME -> query.orderBy(criteriaBuilder.asc(root.get(User.USERNAME_FIELD)));
                case EMAIL -> query.orderBy(criteriaBuilder.asc(root.get(User.EMAIL_FIELD)));
            }
        } else {
            query.orderBy(criteriaBuilder.desc(root.get(User.ID_FIELD)));
        }
    }
}