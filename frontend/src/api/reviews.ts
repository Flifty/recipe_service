import { api } from './axios';
import type { ApiResponse } from '../types/common';
import type { ReviewItem } from '../types/recipe';

export const getReviewsByRecipeId = async (recipeId: number) => {
    const response = await api.get<ApiResponse<ReviewItem[]>>(`/reviews/recipe/${recipeId}`);
    return response.data;
};

export const createReview = async (recipeId: number, text: string) => {
    const response = await api.post<ApiResponse<ReviewItem>>('/reviews', {
        recipeId,
        text,
    });

    return response.data;
};

export const updateReview = async (reviewId: number, text: string) => {
    const response = await api.put<ApiResponse<ReviewItem>>(`/reviews/${reviewId}`, {
        text,
    });

    return response.data;
};

export const deleteReview = async (reviewId: number) => {
    const response = await api.delete<ApiResponse<string>>(`/reviews/${reviewId}`);
    return response.data;
};