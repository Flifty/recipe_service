import { api } from './axios';
import type {
    CreateUpdateRecipePayload,
    PaginationResponse,
    RecipeCardItem,
    RecipeDetails,
    RecipeSortField,
    SortDirection,
} from '../types/recipe';
import type { ApiResponse } from '../types/common';

interface SearchRecipesParams {
    page?: number;
    limit?: number;
    sortField?: RecipeSortField;
    sortDirection?: SortDirection;
    name?: string;
    categoryId?: number | '';
    cuisineId?: number | '';
    cookingTimeMinutes?: number | '';
    servings?: number | '';
}

export const getRecipes = async (page = 0, limit = 5) => {
    const response = await api.get<ApiResponse<PaginationResponse<RecipeCardItem>>>(
        `/recipes/all?page=${page}&limit=${limit}`
    );

    return response.data;
};

export const searchRecipes = async ({
                                        page = 0,
                                        limit = 5,
                                        sortField = 'CREATED_AT',
                                        sortDirection = 'DESC',
                                        name = '',
                                        categoryId = '',
                                        cuisineId = '',
                                        cookingTimeMinutes = '',
                                        servings = '',
                                    }: SearchRecipesParams) => {
    const response = await api.post<ApiResponse<PaginationResponse<RecipeCardItem>>>(
        `/recipes/search?page=${page}&limit=${limit}`,
        {
            deleted: false,
            sortField,
            sortDirection,
            ...(name ? { name } : {}),
            ...(categoryId !== '' ? { categoryId } : {}),
            ...(cuisineId !== '' ? { cuisineId } : {}),
            ...(cookingTimeMinutes !== '' ? { cookingTimeMinutes } : {}),
            ...(servings !== '' ? { servings } : {}),
        }
    );

    return response.data;
};

export const getRecipeById = async (id: string | number) => {
    const response = await api.get<ApiResponse<RecipeDetails>>(`/recipes/${id}`);
    return response.data;
};

export const getMyRecipes = async () => {
    const response = await api.get<ApiResponse<RecipeCardItem[]>>('/recipes/my');
    return response.data;
};

export const createRecipe = async (payload: CreateUpdateRecipePayload) => {
    const response = await api.post<ApiResponse<RecipeDetails>>('/recipes', payload);
    return response.data;
};

export const updateRecipe = async (recipeId: number, payload: CreateUpdateRecipePayload) => {
    const response = await api.put<ApiResponse<RecipeDetails>>(`/recipes/${recipeId}`, payload);
    return response.data;
};

export const deleteRecipe = async (recipeId: number) => {
    await api.delete(`/recipes/${recipeId}`);
};