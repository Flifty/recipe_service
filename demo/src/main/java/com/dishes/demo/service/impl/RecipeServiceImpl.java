package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.RecipeMapper;
import com.dishes.demo.model.constants.ApiErrorMessage;
import com.dishes.demo.model.dto.recipe.RecipeDTO;
import com.dishes.demo.model.dto.recipe.RecipeSearchDTO;
import com.dishes.demo.model.entity.Category;
import com.dishes.demo.model.entity.Cuisine;
import com.dishes.demo.model.entity.Ingredient;
import com.dishes.demo.model.entity.Rating;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.RecipeIngredient;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.enums.RecipeSortField;
import com.dishes.demo.model.enums.SortDirection;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.recipe.CreateRecipeRequest;
import com.dishes.demo.model.request.recipe.IngredientMatchRequest;
import com.dishes.demo.model.request.recipe.RecipeIngredientRequest;
import com.dishes.demo.model.request.recipe.RecipeSearchRequest;
import com.dishes.demo.model.request.recipe.UpdateRecipeRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.model.response.recipe.IngredientMatchResponse;
import com.dishes.demo.model.response.recipe.PaginationResponse;
import com.dishes.demo.repository.CategoryRepository;
import com.dishes.demo.repository.CuisineRepository;
import com.dishes.demo.repository.FavoriteRepository;
import com.dishes.demo.repository.IngredientRepository;
import com.dishes.demo.repository.RatingRepository;
import com.dishes.demo.repository.RecipeRepository;
import com.dishes.demo.repository.ReviewRepository;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.repository.criteria.RecipeSearchCriteria;
import com.dishes.demo.service.RecipeService;
import com.dishes.demo.utils.ApiUtils;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    private final CuisineRepository cuisineRepository;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final ApiUtils apiUtils;
    private final RecipeMapper recipeMapper;

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<RecipeDTO> getById(@NotNull Long recipeId) {
        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(recipeId)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(recipeId)
                ));

        RecipeDTO dto = recipeMapper.toDto(recipe);
        enrichRecipeDto(recipe, dto);

        return DishesResponse.createSuccessful(dto);
    }

    @Override
    @Transactional
    public DishesResponse<RecipeDTO> createRecipe(@NotNull CreateRecipeRequest request) {
        Recipe recipe = recipeMapper.createRecipe(request);

        String currentUserEmail = apiUtils.getCurrentUserEmail();

        if (currentUserEmail != null) {
            User author = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                    .orElseThrow(() -> new NotFoundException(
                            ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                    ));
            recipe.setAuthor(author);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException(
                            ApiErrorMessage.CATEGORY_NOT_FOUND_BY_ID.getMessage(request.getCategoryId())
                    ));
            recipe.setCategory(category);
        }

        if (request.getCuisineId() != null) {
            Cuisine cuisine = cuisineRepository.findById(request.getCuisineId())
                    .orElseThrow(() -> new NotFoundException(
                            ApiErrorMessage.CUISINE_NOT_FOUND_BY_ID.getMessage(request.getCuisineId())
                    ));
            recipe.setCuisine(cuisine);
        }

        applyRecipeIngredients(recipe, request.getIngredients());

        Recipe savedRecipe = recipeRepository.save(recipe);

        RecipeDTO dto = recipeMapper.toDto(savedRecipe);
        enrichRecipeDto(savedRecipe, dto);

        return DishesResponse.createSuccessful(dto);
    }

    @Override
    @Transactional
    public DishesResponse<RecipeDTO> updateRecipe(@NotNull Long recipeId, @NotNull UpdateRecipeRequest request) {
        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(recipeId)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(recipeId)
                ));

        recipeMapper.updateRecipe(recipe, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException(
                            ApiErrorMessage.CATEGORY_NOT_FOUND_BY_ID.getMessage(request.getCategoryId())
                    ));
            recipe.setCategory(category);
        } else {
            recipe.setCategory(null);
        }

        if (request.getCuisineId() != null) {
            Cuisine cuisine = cuisineRepository.findById(request.getCuisineId())
                    .orElseThrow(() -> new NotFoundException(
                            ApiErrorMessage.CUISINE_NOT_FOUND_BY_ID.getMessage(request.getCuisineId())
                    ));
            recipe.setCuisine(cuisine);
        } else {
            recipe.setCuisine(null);
        }

        recipe.getRecipeIngredients().clear();
        applyRecipeIngredients(recipe, request.getIngredients());

        Recipe updatedRecipe = recipeRepository.save(recipe);

        RecipeDTO dto = recipeMapper.toDto(updatedRecipe);
        enrichRecipeDto(updatedRecipe, dto);

        return DishesResponse.createSuccessful(dto);
    }

    @Override
    @Transactional
    public void softDeleteRecipe(Long recipeId) {
        Recipe recipe = recipeRepository.findByIdAndDeletedFalse(recipeId)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.RECIPE_NOT_FOUND_BY_ID.getMessage(recipeId)
                ));

        recipe.setDeleted(true);
        recipeRepository.save(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<PaginationResponse<RecipeSearchDTO>> findAllRecipes(Pageable pageable) {
        List<RecipeSearchDTO> dtoList = recipeRepository.findAll().stream()
                .filter(recipe -> !Boolean.TRUE.equals(recipe.getDeleted()))
                .map(this::mapRecipeToSearchDtoWithStats)
                .toList();

        dtoList = sortRecipeDtoList(dtoList, RecipeSortField.CREATED_AT, SortDirection.DESC);
        return DishesResponse.createSuccessful(toPaginationResponse(dtoList, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<PaginationResponse<RecipeSearchDTO>> searchRecipes(RecipeSearchRequest request, Pageable pageable) {
        Specification<Recipe> specification = new RecipeSearchCriteria(request);

        List<RecipeSearchDTO> dtoList = recipeRepository.findAll(specification).stream()
                .map(this::mapRecipeToSearchDtoWithStats)
                .toList();

        RecipeSortField sortField = request.getSortField() != null ? request.getSortField() : RecipeSortField.CREATED_AT;
        SortDirection sortDirection = request.getSortDirection() != null ? request.getSortDirection() : SortDirection.DESC;

        dtoList = sortRecipeDtoList(dtoList, sortField, sortDirection);
        return DishesResponse.createSuccessful(toPaginationResponse(dtoList, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<IngredientMatchResponse>> matchRecipesByIngredients(IngredientMatchRequest request) {
        Set<String> userIngredients = request.getIngredients() == null
                ? new HashSet<>()
                : request.getIngredients().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());

        List<Recipe> recipes = recipeRepository.findAll().stream()
                .filter(recipe -> !Boolean.TRUE.equals(recipe.getDeleted()))
                .toList();

        List<IngredientMatchResponse> result = new ArrayList<>();

        for (Recipe recipe : recipes) {
            List<String> missingIngredients = new ArrayList<>();
            int matchedCount = 0;

            for (RecipeIngredient recipeIngredient : recipe.getRecipeIngredients()) {
                String ingredientName = recipeIngredient.getIngredient().getName();

                if (ingredientName != null && userIngredients.contains(ingredientName.trim().toLowerCase())) {
                    matchedCount++;
                } else if (ingredientName != null) {
                    missingIngredients.add(ingredientName);
                }
            }

            IngredientMatchResponse response = new IngredientMatchResponse();
            response.setRecipeId(recipe.getId());
            response.setRecipeName(recipe.getName());
            response.setTotalIngredients(recipe.getRecipeIngredients().size());
            response.setMatchedIngredients(matchedCount);
            response.setMissingIngredientsCount(missingIngredients.size());
            response.setMissingIngredients(missingIngredients);

            if (recipe.getCategory() != null) {
                response.setCategoryName(recipe.getCategory().getName());
            }

            if (recipe.getCuisine() != null) {
                response.setCuisineName(recipe.getCuisine().getName());
            }

            result.add(response);
        }

        result.sort(Comparator
                .comparingInt(IngredientMatchResponse::getMissingIngredientsCount)
                .thenComparing(IngredientMatchResponse::getRecipeName));

        return DishesResponse.createSuccessful(result);
    }

    @Override
    @Transactional(readOnly = true)
    public DishesResponse<List<RecipeSearchDTO>> getMyRecipes() {
        String currentUserEmail = apiUtils.getCurrentUserEmail();

        User user = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElseThrow(() -> new NotFoundException(
                        ApiErrorMessage.USER_NOT_FOUND_BY_ID.getMessage(currentUserEmail)
                ));

        List<RecipeSearchDTO> recipes = recipeRepository.findByAuthorIdAndDeletedFalseOrderByIdDesc(user.getId())
                .stream()
                .map(this::mapRecipeToSearchDtoWithStats)
                .toList();

        return DishesResponse.createSuccessful(recipes);
    }

    private void enrichRecipeDto(Recipe recipe, RecipeDTO dto) {
        List<Rating> ratings = ratingRepository.findByRecipeId(recipe.getId());
        double averageRating = ratings.stream()
                .mapToInt(Rating::getValue)
                .average()
                .orElse(0.0);

        dto.setAverageRating(Math.round(averageRating * 100.0) / 100.0);
        dto.setRatingsCount((long) ratings.size());
        dto.setReviewsCount(reviewRepository.countByRecipeIdAndDeletedFalse(recipe.getId()));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        if (currentUserEmail != null) {
            Optional<User> currentUserOpt = userRepository.findByEmailAndDeletedFalse(currentUserEmail);

            if (currentUserOpt.isPresent()) {
                Long currentUserId = currentUserOpt.get().getId();

                Integer myRating = ratingRepository.findByRecipeIdAndUserId(recipe.getId(), currentUserId)
                        .map(Rating::getValue)
                        .orElse(null);

                boolean isFavorite = favoriteRepository.existsByRecipeIdAndUserId(recipe.getId(), currentUserId);

                dto.setMyRating(myRating);
                dto.setIsFavorite(isFavorite);
            } else {
                dto.setMyRating(null);
                dto.setIsFavorite(false);
            }
        } else {
            dto.setMyRating(null);
            dto.setIsFavorite(false);
        }
    }

    private RecipeSearchDTO mapRecipeToSearchDtoWithStats(Recipe recipe) {
        RecipeSearchDTO dto = recipeMapper.toSearchDto(recipe);

        List<Rating> ratings = ratingRepository.findByRecipeId(recipe.getId());
        double averageRating = ratings.stream()
                .mapToInt(Rating::getValue)
                .average()
                .orElse(0.0);

        dto.setAverageRating(Math.round(averageRating * 100.0) / 100.0);
        dto.setRatingsCount((long) ratings.size());
        dto.setReviewsCount(reviewRepository.countByRecipeIdAndDeletedFalse(recipe.getId()));

        String currentUserEmail = apiUtils.getCurrentUserEmail();
        if (currentUserEmail != null) {
            Optional<User> currentUserOpt = userRepository.findByEmailAndDeletedFalse(currentUserEmail);

            if (currentUserOpt.isPresent()) {
                Long currentUserId = currentUserOpt.get().getId();

                Integer myRating = ratingRepository.findByRecipeIdAndUserId(recipe.getId(), currentUserId)
                        .map(Rating::getValue)
                        .orElse(null);

                boolean isFavorite = favoriteRepository.existsByRecipeIdAndUserId(recipe.getId(), currentUserId);

                dto.setMyRating(myRating);
                dto.setIsFavorite(isFavorite);
            } else {
                dto.setMyRating(null);
                dto.setIsFavorite(false);
            }
        } else {
            dto.setMyRating(null);
            dto.setIsFavorite(false);
        }

        return dto;
    }

    private List<RecipeSearchDTO> sortRecipeDtoList(
            List<RecipeSearchDTO> recipes,
            RecipeSortField sortField,
            SortDirection sortDirection
    ) {
        Comparator<RecipeSearchDTO> comparator = switch (sortField) {
            case NAME -> Comparator.comparing(
                    RecipeSearchDTO::getName,
                    Comparator.nullsLast(String::compareToIgnoreCase)
            );
            case COOKING_TIME -> Comparator.comparing(
                    RecipeSearchDTO::getCookingTimeMinutes,
                    Comparator.nullsLast(Integer::compareTo)
            );
            case AVERAGE_RATING -> Comparator.comparing(
                    RecipeSearchDTO::getAverageRating,
                    Comparator.nullsLast(Double::compareTo)
            );
            case RATINGS_COUNT -> Comparator.comparing(
                    RecipeSearchDTO::getRatingsCount,
                    Comparator.nullsLast(Long::compareTo)
            );
            case REVIEWS_COUNT -> Comparator.comparing(
                    RecipeSearchDTO::getReviewsCount,
                    Comparator.nullsLast(Long::compareTo)
            );
            case CREATED_AT -> Comparator.comparing(
                    RecipeSearchDTO::getCreatedAt,
                    Comparator.nullsLast(LocalDateTime::compareTo)
            );
        };

        if (sortDirection == SortDirection.DESC) {
            comparator = comparator.reversed();
        }

        return recipes.stream()
                .sorted(comparator)
                .toList();
    }

    private PaginationResponse<RecipeSearchDTO> toPaginationResponse(List<RecipeSearchDTO> dtoList, Pageable pageable) {
        int total = dtoList.size();
        int fromIndex = Math.min(pageable.getPageNumber() * pageable.getPageSize(), total);
        int toIndex = Math.min(fromIndex + pageable.getPageSize(), total);

        List<RecipeSearchDTO> pageContent = dtoList.subList(fromIndex, toIndex);
        int totalPages = pageable.getPageSize() == 0 ? 1 : (int) Math.ceil((double) total / pageable.getPageSize());

        return PaginationResponse.<RecipeSearchDTO>builder()
                .content(pageContent)
                .pagination(PaginationResponse.Pagination.builder()
                        .total(total)
                        .limit(pageable.getPageSize())
                        .page(pageable.getPageNumber() + 1)
                        .pages(totalPages)
                        .build())
                .build();
    }

    private void applyRecipeIngredients(Recipe recipe, List<RecipeIngredientRequest> ingredientRequests) {
        if (ingredientRequests == null || ingredientRequests.isEmpty()) {
            return;
        }

        for (RecipeIngredientRequest ingredientRequest : ingredientRequests) {
            Ingredient ingredient = ingredientRepository.findById(ingredientRequest.getIngredientId())
                    .orElseThrow(() -> new NotFoundException(
                            ApiErrorMessage.INGREDIENT_NOT_FOUND_BY_ID.getMessage(ingredientRequest.getIngredientId())
                    ));

            RecipeIngredient recipeIngredient = new RecipeIngredient();
            recipeIngredient.setRecipe(recipe);
            recipeIngredient.setIngredient(ingredient);
            recipeIngredient.setAmount(ingredientRequest.getAmount());
            recipeIngredient.setUnit(ingredientRequest.getUnit());

            recipe.getRecipeIngredients().add(recipeIngredient);
        }
    }
}