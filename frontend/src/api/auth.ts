import { api } from './axios';
import type { ApiResponse } from '../types/common';

export interface LoginResponse {
    id: number;
    username: string;
    email: string;
    registrationStatus: string;
    lastLogin: string | null;
    token: string;
    refreshToken: string;
}

export interface ChangePasswordPayload {
    password: string;
    confirmPassword: string;
}

export const loginUser = async (email: string, password: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
        email,
        password,
    });

    return response.data;
};

export const registerUser = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', {
        username,
        email,
        password,
        confirmPassword,
    });

    return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload) => {
    const response = await api.post<ApiResponse<string>>('/auth/change-password', payload);
    return response.data;
};