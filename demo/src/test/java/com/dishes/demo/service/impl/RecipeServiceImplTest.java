package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.RecipeMapper;
import com.dishes.demo.model.dto.recipe.RecipeDTO;
import com.dishes.demo.model.entity.Ingredient;
import com.dishes.demo.model.entity.Rating;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.RecipeIngredient;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.recipe.IngredientMatchRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.model.response.recipe.IngredientMatchResponse;
import com.dishes.demo.repository.CategoryRepository;
import com.dishes.demo.repository.CuisineRepository;
import com.dishes.demo.repository.FavoriteRepository;
import com.dishes.demo.repository.IngredientRepository;
import com.dishes.demo.repository.RatingRepository;
import com.dishes.demo.repository.RecipeRepository;
import com.dishes.demo.repository.ReviewRepository;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.utils.ApiUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceImplTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CuisineRepository cuisineRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private ApiUtils apiUtils;

    @Mock
    private RecipeMapper recipeMapper;

    @InjectMocks
    private RecipeServiceImpl recipeService;

    @Test
    void getByIdShouldReturnRecipeWithRatingAndFavoriteInfo() {
        Recipe recipe = createRecipe(1L, "Борщ");
        User user = createUser(10L, "ivan", "ivan@mail.com");

        Rating rating1 = createRating(1L, 5, recipe, user);
        Rating rating2 = createRating(2L, 3, recipe, user);

        RecipeDTO recipeDTO = new RecipeDTO();
        recipeDTO.setId(1L);
        recipeDTO.setName("Борщ");

        when(recipeRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(recipe));
        when(recipeMapper.toDto(recipe)).thenReturn(recipeDTO);
        when(ratingRepository.findByRecipeId(1L)).thenReturn(List.of(rating1, rating2));
        when(reviewRepository.countByRecipeIdAndDeletedFalse(1L)).thenReturn(4L);
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(ratingRepository.findByRecipeIdAndUserId(1L, 10L)).thenReturn(Optional.of(rating1));
        when(favoriteRepository.existsByRecipeIdAndUserId(1L, 10L)).thenReturn(true);

        DishesResponse<RecipeDTO> response = recipeService.getById(1L);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getName()).isEqualTo("Борщ");
        assertThat(response.getPayload().getAverageRating()).isEqualTo(4.0);
        assertThat(response.getPayload().getRatingsCount()).isEqualTo(2L);
        assertThat(response.getPayload().getReviewsCount()).isEqualTo(4L);
        assertThat(response.getPayload().getMyRating()).isEqualTo(5);
        assertThat(response.getPayload().getIsFavorite()).isTrue();
    }

    @Test
    void getByIdShouldThrowExceptionWhenRecipeNotFound() {
        when(recipeRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> recipeService.getById(100L));
    }

    @Test
    void softDeleteRecipeShouldMarkRecipeAsDeleted() {
        Recipe recipe = createRecipe(1L, "Борщ");

        when(recipeRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(recipe));

        recipeService.softDeleteRecipe(1L);

        assertThat(recipe.getDeleted()).isTrue();
        verify(recipeRepository).save(recipe);
    }

    @Test
    void matchRecipesByIngredientsShouldSortRecipesByMissingIngredientsCount() {
        Recipe beetSalad = createRecipe(1L, "Салат из свеклы");
        addIngredient(beetSalad, "Свекла");
        addIngredient(beetSalad, "Морковь");

        Recipe borsch = createRecipe(2L, "Борщ");
        addIngredient(borsch, "Свекла");
        addIngredient(borsch, "Морковь");
        addIngredient(borsch, "Капуста");
        addIngredient(borsch, "Картофель");

        Recipe chicken = createRecipe(3L, "Курица с овощами");
        addIngredient(chicken, "Курица");
        addIngredient(chicken, "Перец");

        when(recipeRepository.findAll()).thenReturn(List.of(borsch, chicken, beetSalad));

        IngredientMatchRequest request = new IngredientMatchRequest();
        request.setIngredients(List.of("свекла", "морковь"));

        DishesResponse<List<IngredientMatchResponse>> response = recipeService.matchRecipesByIngredients(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload()).hasSize(3);

        assertThat(response.getPayload().get(0).getRecipeName()).isEqualTo("Салат из свеклы");
        assertThat(response.getPayload().get(0).getMissingIngredientsCount()).isEqualTo(0);

        assertThat(response.getPayload().get(1).getRecipeName()).isEqualTo("Борщ");
        assertThat(response.getPayload().get(1).getMissingIngredientsCount()).isEqualTo(2);

        assertThat(response.getPayload().get(2).getRecipeName()).isEqualTo("Курица с овощами");
        assertThat(response.getPayload().get(2).getMissingIngredientsCount()).isEqualTo(2);
    }

    private Recipe createRecipe(Long id, String name) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName(name);
        recipe.setDescription("Описание");
        recipe.setInstructions("Инструкция");
        recipe.setDeleted(false);
        return recipe;
    }

    private void addIngredient(Recipe recipe, String ingredientName) {
        Ingredient ingredient = new Ingredient();
        ingredient.setName(ingredientName);

        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setRecipe(recipe);
        recipeIngredient.setIngredient(ingredient);

        recipe.getRecipeIngredients().add(recipeIngredient);
    }

    private User createUser(Long id, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setDeleted(false);
        return user;
    }

    private Rating createRating(Long id, Integer value, Recipe recipe, User user) {
        Rating rating = new Rating();
        rating.setId(id);
        rating.setValue(value);
        rating.setRecipe(recipe);
        rating.setUser(user);
        return rating;
    }
}