export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stockQuantity: number;
    imageUrl: string | null;
    active: boolean;
    createdAt: string;
    category: Category | null;
}

export interface ProductPage {
    content: Product[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}