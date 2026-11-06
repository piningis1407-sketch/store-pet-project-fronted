import {Product} from "../../products/types/product";


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
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
}