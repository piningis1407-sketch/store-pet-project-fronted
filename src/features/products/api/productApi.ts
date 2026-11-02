import { apiRequest } from '../../../shared/api/http';
import type {
    Product,
    ProductPage,
} from '../types/product';

export interface ProductQuery {
    page: number;
    size: number;
    sort: 'name,asc' | 'price,asc' | 'price,desc' | 'createdAt,desc';
    categoryId?: number;
    search?: string;
}

export interface ProductRequest {
    name: string;
    description: string | null;
    price: number;
    stockQuantity: number;
    imageUrl: string | null;
    categoryId: number | null;
}

export async function getProducts(
    query: ProductQuery,
): Promise<ProductPage> {
    const params = new URLSearchParams({
        page: String(query.page),
        size: String(query.size),
        sort: query.sort,
    });

    if (query.categoryId !== undefined) {
        params.set('categoryId', String(query.categoryId));
    }

    if (query.search?.trim()) {
        params.set('search', query.search.trim());
    }

    return apiRequest<ProductPage>(
        `/api/products?${params.toString()}`,
    );
}

export async function getProductById(
    id: number,
): Promise<Product> {
    return apiRequest<Product>(`/api/products/${id}`);
}

export async function createProduct(
    data: ProductRequest,
): Promise<Product> {
    return apiRequest<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deactivateProduct(
    id: number,
): Promise<void> {
    return apiRequest<void>(`/api/products/${id}`, {
        method: 'DELETE',
    });
}

export async function getAdminProducts(
    query: ProductQuery,
): Promise<ProductPage> {
    const params = new URLSearchParams({
        page: String(query.page),
        size: String(query.size),
        sort: query.sort,
    });

    return apiRequest<ProductPage>(
        `/api/products/admin?${params.toString()}`,
    );
}

export async function activateProduct(id: number): Promise<void> {
    return apiRequest<void>(`/api/products/${id}/activate`, {
        method: 'PATCH',
    });
}

export async function updateProduct(
    id: number,
    data: ProductRequest,
): Promise<Product> {
    return apiRequest<Product>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}