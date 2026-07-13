export interface ApiResponse<T> {
    Code: number;
    Message: string;
    Data: T;
    Errors?: string[];
}

export interface PaginatedResponse<T> {
    Code: number;
    Message: string;
    Data: T[];
    RowTotal?: number;
    Errors?: string[];
}
