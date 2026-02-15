import Header from "@/components/ui/Header";
import { getDeviceType } from "@/lib/device";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/ui/AddToCartButton"; // Refactoring button logic

// Mock Data (In production, fetch from Supabase by ID/Slug)
const PRODUCTS_DB: Record<string, any> = {
    'amul-taaza-toned-fresh-milk': {
        name: 'Amul Taaza Toned Fresh Milk',
        weight: '500 ml',
        price: 27,
        oldPrice: 30,
        image: '🥛',
        description: 'Pasteurized Toned Milk. Min 3.0% Fat, Min 8.5% SNF. Amul milk is the most hygienic liquid milk available in the market. It is pasteurized in state-of-the-art processing plants and pouch-packed to make it conveniently available to consumers.',
        nutrition: { values: ['Energy: 58 kcal', 'Protein: 3.0g', 'Carb: 4.7g', 'Fat: 3.0g'], title: 'Per 100ml' }
    },
    'onion-(medium-size)': {
        name: 'Onion (Medium Size)',
        weight: '1 kg',
        price: 45,
        oldPrice: 60,
        image: '🧅',
        description: 'Fresh Red Onions. Essential for Indian cooking. These onions have a strong flavor and pungent aroma.',
        nutrition: { values: ['Vitamin C', 'Dietary Fiber', 'Iron'], title: 'Key Benefits' }
    }
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const deviceType = await getDeviceType();

    // Fallback for demo if product not in mock DB, generic show
    const product = PRODUCTS_DB[decodedId] || {
        name: decodedId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        weight: '1 unit',
        price: 99,
        image: '🥬',
        description: 'Fresh produce sourced directly from farmers. Quality checked and hygienic.',
        nutrition: { values: ['100% Organic', 'Freshly Picked'], title: 'Highlights' }
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-24">
            <Header deviceType={deviceType} />

            <div className={`
         ${deviceType === 'desktop' ? 'max-w-5xl mx-auto pt-8 flex gap-8 px-4 grid grid-cols-2' : 'flex flex-col'}
      `}>
                {/* Image Section */}
                <div className="bg-white p-8 flex items-center justify-center rounded-2xl shadow-sm border border-slate-100 aspect-square">
                    <span className="text-[120px]">{product.image}</span>
                </div>

                {/* Details Section */}
                <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <div className="mb-1 text-xs font-bold text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded">
                        10 MINS
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">{product.name}</h1>
                    <p className="text-slate-500 font-medium mb-6">{product.weight}</p>

                    <div className="border-t border-b border-slate-100 py-4 mb-6 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-slate-900">₹{product.price}</span>
                            {product.oldPrice && (
                                <span className="text-sm text-slate-400 line-through">MRP ₹{product.oldPrice}</span>
                            )}
                            <span className="text-[10px] text-slate-400">(Inclusive of all taxes)</span>
                        </div>

                        {/* Reuse the Add Button Logic purely */}
                        <div className="w-32">
                            <AddToCartButton product={{ id: decodedId, ...product }} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-2">Product Details</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {product.nutrition && (
                            <div>
                                <h3 className="font-bold text-slate-800 mb-2">{product.nutrition.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.nutrition.values.map((v: string) => (
                                        <span key={v} className="text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
