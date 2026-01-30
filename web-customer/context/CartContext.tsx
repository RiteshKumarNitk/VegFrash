'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type CartItem = {
    id: string;
    name: string;
    price: number;
    unit: 'kg' | 'pc';
    quantity: number;
    image?: string;
};

type CartContextType = {
    items: CartItem[];
    addItem: (product: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    total: number;
    count: number;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('vegfrash_cart');
        if (saved) setItems(JSON.parse(saved));
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('vegfrash_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: any) => {
        setItems(current => {
            const existing = current.find(i => i.id === product.id);
            if (existing) {
                return current.map(i =>
                    i.id === product.id
                        ? { ...i, quantity: i.quantity + (i.unit === 'kg' ? 0.5 : 1) }
                        : i
                );
            }
            return [...current, {
                id: product.id,
                name: product.name,
                price: product.base_price || product.price,
                unit: product.pricing_type === 'per_kg' ? 'kg' : 'pc',
                quantity: product.pricing_type === 'per_kg' ? 0.5 : 1,
                image: product.image
            }];
        });
    };

    const removeItem = (id: string) => {
        setItems(current => current.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setItems(current => {
            return current.map(item => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return item; // Don't remove here, distinct action
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.length;

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, total, count, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
