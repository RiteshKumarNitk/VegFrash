'use client';
import { useCart } from '@/context/CartContext';
import { Clock, Minus, Plus } from 'lucide-react';

type ProductProps = {
    id?: string;
    name: string;
    weight: string;
    price: number;
    oldPrice?: number;
    image?: string;
    isAd?: boolean;
    inStock?: boolean;
};

export default function ProductCard({ id, name, weight, price, oldPrice, image, isAd, inStock = true }: ProductProps) {
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
            </div>

            {/* Time Badge (Mock) */}
            <div className="flex items-center gap-1 bg-slate-100 self-start px-1.5 py-0.5 rounded-[4px]">
                <Clock size={10} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600">12 MINS</span>
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 min-h-[2.5em]">{name}</h3>
                <p className="text-xs text-slate-400 mt-1">{weight}</p>
            </div>

            {/* Price & Action */}
            <div className="flex items-end justify-between mt-2">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 line-through">₹{oldPrice || Math.round(price * 1.2)}</span>
                    <span className="font-bold text-slate-800">₹{price}</span>
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
                    <div className="flex items-center bg-green-600 text-white rounded-lg h-9 shadow-md animate-scale-in overflow-hidden">
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
