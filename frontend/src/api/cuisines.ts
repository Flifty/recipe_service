import { api } from './axios';
import type { NamedEntity, ApiResponse } from '../types/common';

export const getCuisines = async () => {
    const response = await api.get<ApiResponse<NamedEntity[]>>('/cuisines');
    return response.data;
};