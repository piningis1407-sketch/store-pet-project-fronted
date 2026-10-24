import { apiRequest } from '../../../shared/api/http';

import type { Category } from '../types/product';

export function getCategories(): Promise<Category[]> {
    return apiRequest<Category[]>('/api/categories');
}