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

    return apiRequest<ProductPage>(
        `/api/products?${params.toString()}`,
    );
}

export async function getProductById(
    id: number,
): Promise<Product> {
    return apiRequest<Product>(`/api/products/${id}`);
}