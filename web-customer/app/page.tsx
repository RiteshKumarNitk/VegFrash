import { getDeviceType } from "@/lib/device";
import { createClient } from "@supabase/supabase-js";
import ModernHeader from "@/components/ui/ModernHeader";
import ProductCard from "@/components/ui/ProductCard";
import CategoryGrid from "@/components/ui/CategoryGrid";
import FestivalBanner from "@/components/ui/FestivalBanner";
import CartSummary from "@/components/ui/CartSummary";

export const revalidate = 0; // Disable cache for demo purposes

export default async function Home() {
  const deviceType = await getDeviceType();

  // Server-side fetch (using public anon key)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all visible products and categories
  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('*').eq('is_visible', true),
    supabase.from('categories').select('*').order('name')
  ]);

  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];

  // Group products by category_id
  const productsByCategory: Record<string, any[]> = {};

  products.forEach((p) => {
    // Only show available products
    if ((p.total_stock - p.reserved_stock) > 0) {
      if (!productsByCategory[p.category_id]) {
        productsByCategory[p.category_id] = [];
      }
      productsByCategory[p.category_id].push(p);
    }
  });

  // Display only categories that have products with stock
  const activeCategories = categories.filter(cat => productsByCategory[cat.id]?.length > 0);

  return (
    <main className={`min-h-screen bg-white pb-24`}>
      <ModernHeader deviceType={deviceType} />

      <div className={`
         ${deviceType === 'desktop' ? 'max-w-[1280px] mx-auto px-4 lg:px-8 pt-4 space-y-8' : 'space-y-4 pt-2'}
      `}>

        {/* Hero Banner Area */}
        <section className={`${deviceType === 'mobile' ? 'px-4' : ''}`}>
          <FestivalBanner />
        </section>

        {/* Categories Grid */}
        <section className={`${deviceType === 'mobile' ? 'px-4' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-lg lg:text-xl text-slate-800">Shop by Category</h2>
          </div>
          <CategoryGrid categories={[{ id: 'all', name: 'All Items', slug: 'all', image: '🛍️', color: '#ffedd5' }, ...categories]} />
        </section>

        {/* Dynamic Product Sections */}
        {activeCategories.map((category) => (
          <section key={category.id} className={`${deviceType === 'mobile' ? 'pl-4' : ''}`}>
            <div className="flex items-center justify-between mb-4 pr-4">
              <h2 className="font-extrabold text-lg lg:text-2xl text-slate-800">{category.name}</h2>
              {deviceType === 'desktop' && (
                <a href={`/category/${category.slug}`} className="text-brand font-bold cursor-pointer hover:underline text-sm">
                  see all
                </a>
              )}
            </div>

            <div className={`
                    flex gap-4 
                    ${deviceType === 'mobile' ? 'overflow-x-auto no-scrollbar pb-4 pr-4' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}
                 `}>
              {productsByCategory[category.id]?.length > 0 ? (
                productsByCategory[category.id]?.slice(0, 6).map((item: any, i: number) => (
                  <div key={i} className={`${deviceType === 'mobile' ? 'min-w-[150px] w-[150px]' : 'w-full'}`}>
                    <ProductCard {...item} />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center w-full">
                  <p className="text-slate-400 font-medium">Coming soon! Fresh {category.name} will be available shortly.</p>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* ALL PRODUCTS SECTION */}
        <section className={`${deviceType === 'mobile' ? 'px-4' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-lg lg:text-2xl text-slate-800">All Products</h2>
            <a href="/category/all" className="text-brand font-bold cursor-pointer hover:underline text-sm">
              View Full Catalog
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.filter(p => (p.total_stock - p.reserved_stock) > 0).map((item: any, i: number) => (
              <div key={i} className="w-full">
                <ProductCard {...item} />
              </div>
            ))}
          </div>
        </section>

        {activeCategories.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>No products available at the moment.</p>
          </div>
        )}

      </div>
      <CartSummary />
    </main>
  );
}
