export interface NamedEntity {
    id: number;
    name: string;
}

export interface ApiResponse<T> {
    message: string;
    payload: T;
    success: boolean;
}