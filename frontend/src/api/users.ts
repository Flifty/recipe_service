import { api } from './axios';
import type { ApiResponse } from '../types/common';

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    created: string;
    lastLogin: string | null;
}

export interface UpdateUserPayload {
    username: string;
    email: string;
}

export const getUserById = async (userId: number) => {
    const response = await api.get<ApiResponse<UserInfo>>(`/users/${userId}`);
    return response.data;
};

export const updateUser = async (userId: number, payload: UpdateUserPayload) => {
    const response = await api.put<ApiResponse<UserInfo>>(`/users/${userId}`, payload);
    return response.data;
};

export const deleteUser = async (userId: number) => {
    await api.delete(`/users/${userId}`);
};