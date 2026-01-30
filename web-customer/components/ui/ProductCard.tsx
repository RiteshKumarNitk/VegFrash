'use client';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';

type ProductProps = {
    id?: string; // Made optional for now, but will fallback to name as ID if missing (for demo)
    name: string;
    weight: string;
    price: number;
    oldPrice?: number;
    image?: string;
    isAd?: boolean;
};

export default function ProductCard({ id, name, weight, price, oldPrice, image, isAd }: ProductProps) {
    const { items, addItem, removeItem, updateQuantity } = useCart();

    // Use name as ID for demo if real ID missing
    const productId = id || name.toLowerCase().replace(/\s+/g, '-');

    // Find item in cart
    const cartItem = items.find(i => i.id === productId);
    const count = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        addItem({
            id: productId,
            name,
            price,
            unit: 'pc', // Defaulting to pc for simplified demo
            image
        });
    };

    const handleIncrement = () => {
        updateQuantity(productId, 1);
    };

    const handleDecrement = () => {
        if (count > 1) {
            updateQuantity(productId, -1);
        } else {
            removeItem(productId);
        }
    };

    return (
        <div className="brand-card p-3 flex flex-col relative group h-full justify-between hover:shadow-md transition-shadow">
            {isAd && (
                <span className="absolute top-2 left-2 bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded opacity-50 z-10">
                    AD
                </span>
            )}

            {/* Clickable Area navigating to Product Page */}
            <a href={`/product/${productId}`} className="flex-1 flex flex-col w-full cursor-pointer">
                {/* Image Area */}
                <div className="w-full aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl select-none">{image || '🥬'}</span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col items-start w-full">
                    <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 mb-1 select-none">
                        ⚡ 8 MINS
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800 leading-tight mb-1 line-clamp-2 hover:text-brand transition-colors" title={name}>
                        {name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{weight}</p>
                </div>
            </a>

            {/* Footer: Price & Add Button */}
            <div className="flex items-center justify-between w-full mt-auto">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">₹{price}</span>
                    {oldPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{oldPrice}</span>
                    )}
                </div>

                {/* Add Button Logic */}
                {count === 0 ? (
                    <button
                        onClick={handleAdd}
                        className="px-4 py-1.5 rounded-lg border border-brand/50 text-brand bg-brand-light text-sm font-bold shadow-sm uppercase active:scale-95 transition-transform"
                    >
                        ADD
                    </button>
                ) : (
                    <div className="flex items-center bg-brand rounded-lg text-white h-8 shadow-sm animate-in zoom-in duration-200">
                        <button
                            onClick={handleDecrement}
                            className="px-2.5 h-full font-bold hover:bg-brand-dark rounded-l-lg active:bg-brand-dark"
                        >-</button>
                        <span className="text-xs font-bold min-w-[20px] text-center">{count}</span>
                        <button
                            onClick={handleIncrement}
                            className="px-2.5 h-full font-bold hover:bg-brand-dark rounded-r-lg active:bg-brand-dark"
                        >+</button>
                    </div>
                )}
            </div>
        </div>
    );
}
