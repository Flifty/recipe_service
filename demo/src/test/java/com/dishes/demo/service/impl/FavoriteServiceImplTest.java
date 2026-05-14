package com.dishes.demo.service.impl;

import com.dishes.demo.mapper.FavoriteMapper;
import com.dishes.demo.model.dto.favorite.FavoriteDTO;
import com.dishes.demo.model.entity.Favorite;
import com.dishes.demo.model.entity.Recipe;
import com.dishes.demo.model.entity.User;
import com.dishes.demo.model.exception.DataExistException;
import com.dishes.demo.model.exception.NotFoundException;
import com.dishes.demo.model.request.favorite.CreateFavoriteRequest;
import com.dishes.demo.model.response.recipe.DishesResponse;
import com.dishes.demo.repository.FavoriteRepository;
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
class FavoriteServiceImplTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FavoriteMapper favoriteMapper;

    @Mock
    private ApiUtils apiUtils;

    @InjectMocks
    private FavoriteServiceImpl favoriteService;

    @Test
    void addToFavoritesShouldCreateFavorite() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        Favorite favorite = new Favorite();
        favorite.setId(100L);
        favorite.setUser(user);
        favorite.setRecipe(recipe);

        FavoriteDTO favoriteDTO = new FavoriteDTO(100L, 10L, "Борщ", 1L, "ivan");

        CreateFavoriteRequest request = new CreateFavoriteRequest();
        request.setRecipeId(10L);

        when(recipeRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(recipe));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByRecipeIdAndUserId(10L, 1L)).thenReturn(Optional.empty());
        when(favoriteRepository.save(any(Favorite.class))).thenReturn(favorite);
        when(favoriteMapper.toDto(favorite)).thenReturn(favoriteDTO);

        DishesResponse<FavoriteDTO> response = favoriteService.addToFavorites(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload().getRecipeName()).isEqualTo("Борщ");

        verify(favoriteRepository).save(any(Favorite.class));
    }

    @Test
    void addToFavoritesShouldThrowExceptionWhenFavoriteAlreadyExists() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setRecipe(recipe);

        CreateFavoriteRequest request = new CreateFavoriteRequest();
        request.setRecipeId(10L);

        when(recipeRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(recipe));
        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByRecipeIdAndUserId(10L, 1L)).thenReturn(Optional.of(favorite));

        assertThrows(DataExistException.class, () -> favoriteService.addToFavorites(request));

        verify(favoriteRepository, never()).save(any(Favorite.class));
    }

    @Test
    void removeFromFavoritesShouldDeleteFavorite() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        Favorite favorite = new Favorite();
        favorite.setId(100L);
        favorite.setUser(user);
        favorite.setRecipe(recipe);

        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByRecipeIdAndUserId(10L, 1L)).thenReturn(Optional.of(favorite));

        DishesResponse<String> response = favoriteService.removeFromFavorites(10L);

        assertThat(response.isSuccess()).isTrue();
        verify(favoriteRepository).delete(favorite);
    }

    @Test
    void getMyFavoritesShouldReturnCurrentUserFavorites() {
        User user = createUser(1L, "ivan", "ivan@mail.com");
        Recipe recipe = createRecipe(10L, "Борщ");

        Favorite favorite = new Favorite();
        favorite.setId(100L);
        favorite.setUser(user);
        favorite.setRecipe(recipe);

        FavoriteDTO favoriteDTO = new FavoriteDTO(100L, 10L, "Борщ", 1L, "ivan");

        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUserId(1L)).thenReturn(List.of(favorite));
        when(favoriteMapper.toDto(favorite)).thenReturn(favoriteDTO);

        DishesResponse<List<FavoriteDTO>> response = favoriteService.getMyFavorites();

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPayload()).hasSize(1);
        assertThat(response.getPayload().get(0).getRecipeName()).isEqualTo("Борщ");
    }

    @Test
    void removeFromFavoritesShouldThrowExceptionWhenFavoriteNotFound() {
        User user = createUser(1L, "ivan", "ivan@mail.com");

        when(apiUtils.getCurrentUserEmail()).thenReturn("ivan@mail.com");
        when(userRepository.findByEmailAndDeletedFalse("ivan@mail.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByRecipeIdAndUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> favoriteService.removeFromFavorites(10L));
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