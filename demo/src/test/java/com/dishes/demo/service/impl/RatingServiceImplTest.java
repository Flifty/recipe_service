package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.RatingMapper;
import com.dishes.demo.model.dto.rating.RatingDTO;
import com.dishes.demo.model.dto.rating.RecipeRatingSummaryDTO;
import com.dishes.demo.model.entity.Rating;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.InvalidDataException;
import com.dishes.demo.model.request.rating.CreateRatingRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.RatingRepository;
import com.dishes.demo.repository.RecipeRepository;
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
class RatingServiceImplTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RatingMapper ratingMapper;

    @Mock
    private ApiUtils apiUtils;

    @InjectMocks
    private RatingServiceImpl ratingService;

    @Test
    void createOrUpdateRatingShouldCreateNewRating() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        CreateRatingRequest request = new CreateRatingRequest();
        request.setRecipeId(10L);
        request.setValue(5);

        Rating savedRating = new Rating();
        savedRating.setId(100L);
        savedRating.setValue(5);
        savedRating.setRecipe(recipe);
        savedRating.setUser(user);

        RatingDTO ratingDTO = new RatingDTO(100L, 5, 10L, 1L, "ivan");

        when(recipeRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(recipe));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(ratingRepository.findByRecipeIdAndUserId(10L, 1L)).thenReturn(Optional.empty());
        when(ratingRepository.save(any(Rating.class))).thenReturn(savedRating);
        when(ratingMapper.toDto(savedRating)).thenReturn(ratingDTO);

        DishesResponse<RatingDTO> response = ratingService.createOrUpdateRating(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getValue()).isEqualTo(5);

        verify(ratingRepository).save(any(Rating.class));
    }

    @Test
    void createOrUpdateRatingShouldUpdateExistingRating() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        Rating rating = new Rating();
        rating.setId(100L);
        rating.setValue(3);
        rating.setRecipe(recipe);
        rating.setUser(user);

        CreateRatingRequest request = new CreateRatingRequest();
        request.setRecipeId(10L);
        request.setValue(5);

        RatingDTO ratingDTO = new RatingDTO(100L, 5, 10L, 1L, "ivan");

        when(recipeRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(recipe));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(ratingRepository.findByRecipeIdAndUserId(10L, 1L)).thenReturn(Optional.of(rating));
        when(ratingRepository.save(rating)).thenReturn(rating);
        when(ratingMapper.toDto(rating)).thenReturn(ratingDTO);

        DishesResponse<RatingDTO> response = ratingService.createOrUpdateRating(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(rating.getValue()).isEqualTo(5);
        assertThat(response.getPayload().getValue()).isEqualTo(5);
    }

    @Test
    void createOrUpdateRatingShouldThrowExceptionWhenValueIsInvalid() {
        CreateRatingRequest request = new CreateRatingRequest();
        request.setRecipeId(10L);
        request.setValue(6);

        assertThrows(InvalidDataException.class, () -> ratingService.createOrUpdateRating(request));

        verify(ratingRepository, never()).save(any(Rating.class));
    }

    @Test
    void getRecipeRatingSummaryShouldReturnAverageAndCount() {
        Recipe recipe = createRecipe(10L, "Борщ");
        User user = createUser(1L, "ivan", "ivan@mail.com");

        Rating rating1 = createRating(1L, 5, recipe, user);
        Rating rating2 = createRating(2L, 4, recipe, user);
        Rating rating3 = createRating(3L, 3, recipe, user);

        when(recipeRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(recipe));
        when(ratingRepository.findAll()).thenReturn(List.of(rating1, rating2, rating3));
        when(ratingRepository.countByRecipeId(10L)).thenReturn(3L);

        DishesResponse<RecipeRatingSummaryDTO> response = ratingService.getRecipeRatingSummary(10L);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getRecipeId()).isEqualTo(10L);
        assertThat(response.getPayload().getAverageRating()).isEqualTo(4.0);
        assertThat(response.getPayload().getRatingsCount()).isEqualTo(3L);
    }

    private User createUser(Long id, String username, String email) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(email);
        user.setDeleted(false);
        return user;
    }

    private Recipe createRecipe(Long id, String name) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName(name);
        recipe.setDeleted(false);
        return recipe;
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