export interface PaginationInfo {
    total: number;
    limit: number;
    page: number;
    pages: number;
}

export interface PaginationResponse<T> {
    content: T[];
    pagination: PaginationInfo;
}

export type RecipeSortField =
    | 'NAME'
    | 'CREATED_AT'
    | 'COOKING_TIME'
    | 'AVERAGE_RATING'
    | 'RATINGS_COUNT'
    | 'REVIEWS_COUNT';

export type SortDirection = 'ASC' | 'DESC';

export interface RecipeCardItem {
    id: number;
    name: string;
    description: string;
    cookingTimeMinutes: number;
    servings: number;
    imageUrl: string | null;
    categoryName: string;
    cuisineName: string;
    deleted: boolean;
    createdAt: string;
    averageRating: number;
    ratingsCount: number;
    reviewsCount: number;
    myRating: number | null;
    isFavorite: boolean;
}

export interface RecipeIngredientItem {
    ingredientId: number;
    ingredientName: string;
    amount: string;
    unit: string | null;
}

export interface RecipeDetails {
    id: number;
    name: string;
    description: string;
    instructions: string;
    cookingTimeMinutes: number;
    servings: number;
    imageUrl: string | null;
    categoryId: number | null;
    categoryName: string | null;
    cuisineId: number | null;
    cuisineName: string | null;
    authorId: number | null;
    authorUsername: string | null;
    ingredients: RecipeIngredientItem[];
    averageRating: number;
    ratingsCount: number;
    reviewsCount: number;
    myRating: number | null;
    isFavorite: boolean;
}

export interface FavoriteItem {
    id: number;
    recipeId: number;
    recipeName: string;
    userId: number;
    username: string;
}

export interface ReviewItem {
    id: number;
    text: string;
    created: string;
    recipeId: number;
    userId: number;
    username: string;
}

export interface RecipeIngredientPayload {
    ingredientId: number;
    amount: string;
    unit: string | null;
}

export interface CreateUpdateRecipePayload {
    name: string;
    description: string;
    instructions: string;
    cookingTimeMinutes: number;
    servings: number;
    imageUrl: string | null;
    categoryId: number | null;
    cuisineId: number | null;
    ingredients: RecipeIngredientPayload[];
}