import { api } from './axios';
import type { NamedEntity, ApiResponse } from '../types/common';

export const getCategories = async () => {
    const response = await api.get<ApiResponse<NamedEntity[]>>('/categories');
    return response.data;
};