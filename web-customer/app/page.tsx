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

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('categories').select('*').order('name')
  ]);

  const featured = productsRes.data || [];
  const categories = categoriesRes.data || [];

  // Filter for sections (using category names or slugs if possible, simplified here)
  const vegetables = featured.filter(p => p.category_id && categories.find(c => c.id === p.category_id)?.slug === 'fruits-vegetables');
  // For demo if slugs aren't perfectly matched or if category_id usage is tricky in pure SQL without join,
  // we might want to fetch with join. But for now let's do a simple client-side filter or loose filter.
  // Actually, let's fetch products with categories joined to make it easier filtering.

  // Re-fetch with join for easier filtering
  const { data: productsWithCats } = await supabase.from('products').select('*, categories(slug)');

  const allProducts = productsWithCats || [];
  const vegProducts = allProducts.filter((p: any) => ['vegetables', 'fruits-vegetables'].includes(p.categories?.slug));
  const fruitProducts = allProducts.filter((p: any) => p.categories?.slug === 'fruits');
  const dailyProducts = allProducts.filter((p: any) => !['vegetables', 'fruits', 'fruits-vegetables'].includes(p.categories?.slug));

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

        {/* Categories */}
        <section className={`${deviceType === 'mobile' ? 'px-4' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-lg lg:text-xl text-slate-800">Shop by Category</h2>
          </div>
          <CategoryGrid categories={categories} />
        </section>

        {/* Products Row 1: Vegetables */}
        {/* Products Row 1: Vegetables */}
        <section className={`${deviceType === 'mobile' ? 'pl-4' : ''}`}>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="font-extrabold text-lg lg:text-2xl text-slate-800">Farm Fresh Veggies</h2>
            {deviceType === 'desktop' && <a href="/category/vegetables" className="text-brand font-bold cursor-pointer hover:underline text-sm">see all</a>}
          </div>

          <div className={`
                flex gap-4 
                ${deviceType === 'mobile' ? 'overflow-x-auto no-scrollbar pb-4 pr-4' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}
             `}>
            {vegProducts.map((item: any, i: number) => (
              <div key={i} className={`${deviceType === 'mobile' ? 'min-w-[150px] w-[150px]' : 'w-full'}`}>
                <ProductCard {...item} />
              </div>
            ))}
            {vegProducts.length === 0 && <p className="text-slate-400 text-sm">No vegetables in stock.</p>}
          </div>
        </section>

        {/* Products Row 2: Fruits */}
        <section className={`${deviceType === 'mobile' ? 'pl-4' : ''}`}>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="font-extrabold text-lg lg:text-2xl text-slate-800">Fresh Fruits</h2>
            {deviceType === 'desktop' && <a href="/category/fruits" className="text-brand font-bold cursor-pointer hover:underline text-sm">see all</a>}
          </div>

          <div className={`
                flex gap-4 
                ${deviceType === 'mobile' ? 'overflow-x-auto no-scrollbar pb-4 pr-4' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}
                `}>
            {fruitProducts.map((item: any, i: number) => (
              <div key={i} className={`${deviceType === 'mobile' ? 'min-w-[150px] w-[150px]' : 'w-full'}`}>
                <ProductCard {...item} />
              </div>
            ))}
            {fruitProducts.length === 0 && <p className="text-slate-400 text-sm">No fruits in stock.</p>}
          </div>
        </section>

        {/* Products Row 2: Daily Essentials */}
        <section className={`${deviceType === 'mobile' ? 'pl-4' : ''}`}>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="font-extrabold text-lg lg:text-2xl text-slate-800">Daily Essentials</h2>
            {deviceType === 'desktop' && <span className="text-brand font-bold cursor-pointer text-sm">see all</span>}
          </div>

          <div className={`
                flex gap-4 
                ${deviceType === 'mobile' ? 'overflow-x-auto no-scrollbar pb-4 pr-4' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}
             `}>
            {dailyProducts.map((item: any, i: number) => (
              <div key={i} className={`${deviceType === 'mobile' ? 'min-w-[150px] w-[150px]' : 'w-full'}`}>
                <ProductCard {...item} />
              </div>
            ))}
            {dailyProducts.length === 0 && <p className="text-slate-400 text-sm">No items in stock.</p>}
          </div>
        </section>

      </div>
      <CartSummary />
    </main>
  );
}
