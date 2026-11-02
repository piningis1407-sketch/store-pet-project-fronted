import { apiRequest } from '../../../shared/api/http';

import type { Category } from '../types/product';

export interface CategoryRequest {
    name: string;
    description: string | null;
}

export function getCategories(): Promise<Category[]> {
    return apiRequest<Category[]>('/api/categories');
}

export function createCategory(
    data: CategoryRequest,
): Promise<Category> {
    return apiRequest<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function deactivateCategory(
    id: number,
): Promise<void> {
    return apiRequest<void>(`/api/categories/${id}`, {
        method: 'DELETE',
    });
}