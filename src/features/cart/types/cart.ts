import type {Product} from "../../products/types/product";


export interface CartItem {
    productId: number;
    name: string;
    price: number;
    imageUrl: string | null;
    stockQuantity: number;
    quantity: number;
}

export interface CartContextType {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (product: Product) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
}