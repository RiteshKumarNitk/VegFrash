import Header from "@/components/ui/Header";
import ProductCard from "@/components/ui/ProductCard";
import { getDeviceType } from "@/lib/device";

// Mock Data Source - In production this fetches from Supabase
const PRODUCTS = [
    { name: 'Red Onion (Pyaz)', weight: '1 kg', price: 42, oldPrice: 60, image: '🧅', category: 'vegetables' },
    { name: 'Potato (Aloo)', weight: '1 kg', price: 35, oldPrice: 40, image: '🥔', category: 'vegetables' },
    { name: 'Tomato (Hybrid)', weight: '500 g', price: 18, oldPrice: 24, image: '🍅', category: 'vegetables' },
    { name: 'Cucumber (Kheera)', weight: '500 g', price: 24, image: '🥒', category: 'vegetables' },
    { name: 'Amul Taaza Milk', weight: '500 ml', price: 27, oldPrice: 30, image: '🥛', category: 'dairy' },
    { name: 'Nandini GoodLife', weight: '500 ml', price: 28, image: '🥛', category: 'dairy' },
];

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const deviceType = await getDeviceType();

    // Filter products by slug (mock query)
    // In real app: const data = await supabase.from('products').select().eq('category', slug)
    const categoryProducts = PRODUCTS.filter(p =>
        decodedSlug === 'all' || p.category.includes(decodedSlug.toLowerCase()) || decodedSlug.toLowerCase().includes(p.category) || decodedSlug === 'vegetables'
    );

    // Extend list for demo visual
    const displayProducts = [...categoryProducts, ...categoryProducts, ...categoryProducts];

    return (
        <main className="min-h-screen bg-white pb-20">
            <Header deviceType={deviceType} />

            <div className={`
         ${deviceType === 'desktop' ? 'max-w-[1280px] mx-auto pt-6 px-4 lg:px-0' : 'px-4 pt-4'}
      `}>
                {/* Breadcrumb / Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold capitalize text-slate-800">
                        {decodedSlug}
                    </h1>
                    <p className="text-sm text-slate-500">Fresh {decodedSlug} delivered in 10 minutes</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayProducts.map((p, i) => (
                        <div key={i}>
                            <ProductCard {...p} id={`${slug}-${i}`} />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
