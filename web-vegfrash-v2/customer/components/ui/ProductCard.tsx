'use client';
import { useCart } from '@/context/CartContext';
import { Clock, Minus, Plus, Ticket } from 'lucide-react';

type ProductProps = {
    id?: string;
    name: string;
    weight: string;
    price: number;
    old_price?: number;
    oldPrice?: number; // Keep for backward compatibility if needed temporarily
    image?: string;
    isAd?: boolean;
    inStock?: boolean;
    discount_config?: {
        type: string;
        value: number;
        label: string;
    } | null;
};

export default function ProductCard({ id, name, weight, price, old_price, oldPrice, image, isAd, inStock = true, discount_config }: ProductProps) {
    const { items, addItem, removeItem, updateQuantity } = useCart();
    const displayOldPrice = old_price || oldPrice;

    // Automated Price Deduction Logic
    let finalPrice = price;
    if (discount_config && displayOldPrice) {
        if (discount_config.type === 'percentage') {
            finalPrice = Math.round(displayOldPrice * (1 - (discount_config.value / 100)));
        } else {
            finalPrice = displayOldPrice - discount_config.value;
        }
    }

    // Use name as ID for demo if real ID missing
    const productId = id || name.toLowerCase().replace(/\s+/g, '-');

    // Find item in cart
    const cartItem = items.find(i => i.id === productId);
    const count = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        addItem({
            id: productId,
            name,
            price: finalPrice, // Use automated price
            weight,
            unit: 'pc', // Defaulting to pc for simplified demo
            image
        });
    };

    const handleIncrement = () => {
        updateQuantity(productId, 1);
    };

    const handleDecrement = () => {
        if (count > 1) updateQuantity(productId, -1);
        else removeItem(productId);
    };

    return (
        <div className="bg-white rounded-xl p-3 flex flex-col gap-2 h-full border border-slate-100 shadow-sm relative overflow-hidden group">
            {/* Image Area */}
            <div className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center text-5xl mb-1 relative overflow-hidden">
                {image?.startsWith('http') ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover mix-blend-multiply"
                        loading="lazy"
                    />
                ) : (
                    <span>{image}</span>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">OUT OF STOCK</span>
                    </div>
                )}
                {discount_config && inStock && (
                    <div className="absolute top-0 right-0 z-10">
                        <div className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-bl-xl shadow-lg flex items-center gap-1 animate-pulse-slow">
                            <Ticket size={10} fill="currentColor" />
                            {discount_config.type === 'percentage' ? `${discount_config.value}% OFF` : `₹${discount_config.value} OFF`}
                        </div>
                    </div>
                )}
            </div>

            {/* Time Badge & Offer Label */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-[4px]">
                    <Clock size={10} className="text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-600">12 MINS</span>
                </div>
                {discount_config?.label && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                        {discount_config.label}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 min-h-[2.5em]">{name}</h3>
                {/* Weight hidden for customer by request */}
            </div>

            {/* Price & Action */}
            <div className="flex items-end justify-between mt-2">
                <div className="flex flex-col">
                    {displayOldPrice && (
                        <span className="text-xs text-slate-400 line-through">₹{displayOldPrice}</span>
                    )}
                    <span className="font-bold text-slate-800">₹{finalPrice}</span>
                </div>

                {/* Smart Button */}
                {!inStock ? (
                    <button disabled className="text-xs font-bold text-slate-300 border border-slate-200 px-4 py-1.5 rounded-lg">
                        SOLD
                    </button>
                ) : count === 0 ? (
                    <button
                        onClick={handleAdd}
                        className="bg-red-50 text-red-600 border border-red-100 font-bold text-sm px-5 py-1.5 rounded-lg uppercase shadow-sm active:scale-95 transition-transform"
                    >
                        ADD
                    </button>
                ) : (
                    <div className="flex items-center bg-brand text-white rounded-lg h-9 shadow-md animate-scale-in overflow-hidden">
                        <button onClick={handleDecrement} className="w-8 h-full flex items-center justify-center hover:bg-black/20 active:bg-black/40 transition-colors">
                            <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{count}</span>
                        <button onClick={handleIncrement} className="w-8 h-full flex items-center justify-center hover:bg-black/20 active:bg-black/40 transition-colors">
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
