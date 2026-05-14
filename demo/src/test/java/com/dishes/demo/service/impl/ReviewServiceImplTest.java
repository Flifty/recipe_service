package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.ReviewMapper;
import com.dishes.demo.model.dto.review.ReviewDTO;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.Review;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.review.CreateReviewRequest;
import com.dishes.demo.model.request.review.UpdateReviewRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.RecipeRepository;
import com.dishes.demo.repository.ReviewRepository;
import com.dishes.demo.repository.UserRepository;
import com.dishes.demo.utils.ApiUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewMapper reviewMapper;

    @Mock
    private ApiUtils apiUtils;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @Test
    void createReviewShouldSaveReviewForRecipeAndCurrentUser() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        CreateReviewRequest request = new CreateReviewRequest();
        request.setRecipeId(10L);
        request.setText("Очень вкусный рецепт");

        Review savedReview = new Review();
        savedReview.setId(100L);
        savedReview.setText("Очень вкусный рецепт");
        savedReview.setRecipe(recipe);
        savedReview.setUser(user);
        savedReview.setCreated(LocalDateTime.now());
        savedReview.setDeleted(false);

        ReviewDTO reviewDTO = new ReviewDTO(
                100L,
                "Очень вкусный рецепт",
                savedReview.getCreated(),
                10L,
                1L,
                "ivan"
        );

        when(recipeRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(recipe));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);
        when(reviewMapper.toDto(savedReview)).thenReturn(reviewDTO);

        DishesResponse<ReviewDTO> response = reviewService.createReview(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getText()).isEqualTo("Очень вкусный рецепт");

        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void updateReviewShouldChangeTextWhenUserIsAuthor() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        Review review = new Review();
        review.setId(100L);
        review.setText("Старый текст");
        review.setUser(user);
        review.setRecipe(recipe);
        review.setDeleted(false);

        UpdateReviewRequest request = new UpdateReviewRequest();
        request.setText("Новый текст");

        ReviewDTO reviewDTO = new ReviewDTO(
                100L,
                "Новый текст",
                LocalDateTime.now(),
                10L,
                1L,
                "ivan"
        );

        when(reviewRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(review));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(reviewRepository.save(review)).thenReturn(review);
        when(reviewMapper.toDto(review)).thenReturn(reviewDTO);

        DishesResponse<ReviewDTO> response = reviewService.updateReview(100L, request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(review.getText()).isEqualTo("Новый текст");
        assertThat(response.getPayload().getText()).isEqualTo("Новый текст");
    }

    @Test
    void updateReviewShouldThrowExceptionWhenUserIsNotAuthor() {
        User author = createUser(1L, "ivan", "ivan@mail.com");
        User anotherUser = createUser(2L, "petr", "petr@mail.com");

        Review review = new Review();
        review.setId(100L);
        review.setText("Текст");
        review.setUser(author);
        review.setDeleted(false);

        UpdateReviewRequest request = new UpdateReviewRequest();
        request.setText("Новый текст");

        when(reviewRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(review));
        when(apiUtils.getCurrentUserEmail()).thenReturn("petr@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("petr@mail.com")).thenReturn(Optional.of(anotherUser));

        assertThrows(NotFoundException.class, () -> reviewService.updateReview(100L, request));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void deleteReviewShouldMarkReviewAsDeletedWhenUserIsAuthor() {
        User user = createUser(1L, "ivan", "ivan@mail.com");

        Review review = new Review();
        review.setId(100L);
        review.setText("Текст");
        review.setUser(user);
        review.setDeleted(false);

        when(reviewRepository.findByIdAndDeletedFalse(100L)).thenReturn(Optional.of(review));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(reviewRepository.save(review)).thenReturn(review);

        DishesResponse<String> response = reviewService.deleteReview(100L);

        assertThat(response.isSuccess()).isTrue();
        assertThat(review.getDeleted()).isTrue();

        verify(reviewRepository).save(review);
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
}