'use client';
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: any }) {
    const { items, addItem, removeItem, updateQuantity } = useCart();

    // Logic extracted from ProductCard for reusability
    const productId = product.id || product.name.toLowerCase().replace(/\s+/g, '-');
    const cartItem = items.find(i => i.id === productId);
    const count = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        addItem({
            id: productId,
            name: product.name,
            price: product.price,
            unit: 'pc',
            image: product.image
        });
    };

    if (count === 0) {
        return (
            <button
                onClick={handleAdd}
                className="w-full py-2 rounded-lg border border-brand/50 text-brand bg-brand-light text-sm font-bold shadow-sm uppercase active:scale-95 transition-transform"
            >
                ADD
            </button>
        );
    }

    return (
        <div className="flex items-center bg-brand rounded-lg text-white h-9 shadow-sm w-full">
            <button
                onClick={() => {
                    if (count <= 1) removeItem(productId);
                    else updateQuantity(productId, -1);
                }}
                className="px-3 h-full font-bold hover:bg-brand-dark rounded-l-lg flex-1"
            >-</button>
            <span className="text-sm font-bold min-w-[20px] text-center">{count}</span>
            <button
                onClick={() => updateQuantity(productId, 1)}
                className="px-3 h-full font-bold hover:bg-brand-dark rounded-r-lg flex-1"
            >+</button>
        </div>
    );
}
