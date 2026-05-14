import { api } from './axios';
import type { ApiResponse } from '../types/common';

export interface RatingItem {
    id: number;
    value: number;
    recipeId: number;
    userId: number;
    username: string;
}

export interface RecipeRatingSummary {
    recipeId: number;
    averageRating: number;
    ratingsCount: number;
}

export const createOrUpdateRating = async (recipeId: number, value: number) => {
    const response = await api.post<ApiResponse<RatingItem>>('/ratings', {
        recipeId,
        value,
    });

    return response.data;
};

export const getRecipeRatingSummary = async (recipeId: number) => {
    const response = await api.get<ApiResponse<RecipeRatingSummary>>(`/ratings/recipe/${recipeId}`);
    return response.data;
};