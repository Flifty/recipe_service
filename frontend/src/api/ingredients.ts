import { api } from './axios';
import type { ApiResponse, NamedEntity } from '../types/common';

export const getIngredients = async () => {
    const response = await api.get<ApiResponse<NamedEntity[]>>('/ingredients');
    return response.data;
};