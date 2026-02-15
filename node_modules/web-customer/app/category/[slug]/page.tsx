import ModernHeader from "@/components/ui/ModernHeader";
import ProductCard from "@/components/ui/ProductCard";
import { getDeviceType } from "@/lib/device";
import { createClient } from "@/lib/supabase";

export const revalidate = 0; // Disable cache for demo purposes

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const deviceType = await getDeviceType();

    // Init Supabase
    const supabase = createClient();

    // --- DATA RESOLUTION ---
    let displayProducts: any[] = [];
    let categoryName = decodedSlug;

    // Strategy: Determine Category ID first, then fetch products.
    // 1. Exact Match or Mapped Match or Fuzzy
    let catData = null;

    if (decodedSlug !== 'all') {
        const slugMap: Record<string, string> = {
            'vegetables': 'fruits-vegetables',
            'fruits': 'fruits-vegetables',
            'veggies': 'fruits-vegetables',
            'vegetable': 'fruits-vegetables'
        };

        // 1. Try Exact Match First (Priority)
        const { data: exact } = await supabase
            .from('categories')
            .select('id, name')
            .ilike('slug', decodedSlug)
            .maybeSingle();

        if (exact) {
            catData = exact;
        } else {
            // 2. Try Mapped Match (Alias)
            const mappedSlug = slugMap[decodedSlug.toLowerCase()];
            if (mappedSlug) {
                const { data: mapped } = await supabase
                    .from('categories')
                    .select('id, name')
                    .ilike('slug', mappedSlug)
                    .maybeSingle();
                catData = mapped;
            }
        }

        // 3. Fallback to Fuzzy if still nothing
        if (!catData) {
            const cleanSlug = decodedSlug.replace(/-/g, ' ').split(' ')[0];
            const { data: fuzzy } = await supabase
                .from('categories')
                .select('id, name')
                .ilike('slug', `%${cleanSlug}%`)
                .limit(1)
                .maybeSingle();
            catData = fuzzy;
        }
    }

    // --- FETCH PRODUCTS ---
    if (catData) {
        // Safe access now
        categoryName = catData.name;

        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('is_visible', true)
            .eq('category_id', catData.id);
        displayProducts = data || [];
    } else if (decodedSlug === 'all') {
        const { data } = await supabase.from('products').select('*').eq('is_visible', true);
        displayProducts = data || [];
        categoryName = "All Products";
    }

    // Client-side filtering as backup if specific logic needed (e.g. reserving stock calc)
    // Note: displayProducts is explicitly array now
    displayProducts = displayProducts.filter((p: any) => (p.total_stock - p.reserved_stock) > 0);

    return (
        <main className="min-h-screen bg-white pb-20">
            <ModernHeader deviceType={deviceType} />

            <div className={`
         ${deviceType === 'desktop' ? 'max-w-[1280px] mx-auto pt-6 px-4 lg:px-0' : 'px-4 pt-4'}
      `}>
                {/* Breadcrumb / Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold capitalize text-slate-800">
                        {categoryName}
                    </h1>
                    <p className="text-sm text-slate-500">Fresh {categoryName} delivered in 10 minutes</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {displayProducts.map((p, i) => (
                        <div key={p.id || i}>
                            <ProductCard {...p} />
                        </div>
                    ))}
                    {displayProducts.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            <p>No fresh items found in {decodedSlug}.</p>
                            <a href="/" className="text-brand font-bold mt-2 inline-block">Browse All</a>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
