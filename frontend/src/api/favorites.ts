import { api } from './axios';
import type { ApiResponse } from '../types/common';
import type { FavoriteItem } from '../types/recipe';

export const getMyFavorites = async () => {
    const response = await api.get<ApiResponse<FavoriteItem[]>>('/favorites/my');
    return response.data;
};

export const addToFavorites = async (recipeId: number) => {
    const response = await api.post<ApiResponse<FavoriteItem>>('/favorites', {
        recipeId,
    });

    return response.data;
};

export const removeFromFavorites = async (recipeId: number) => {
    const response = await api.delete<ApiResponse<string>>(`/favorites/${recipeId}`);
    return response.data;
};