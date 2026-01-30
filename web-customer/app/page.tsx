import { getDeviceType } from "@/lib/device";
import Header from "@/components/ui/Header";
import ProductCard from "@/components/ui/ProductCard";
import CategoryGrid from "@/components/ui/CategoryGrid";
import FestivalBanner from "@/components/ui/FestivalBanner";

export default async function Home() {
  const deviceType = await getDeviceType();
  // We can also fetch data server-side here

  const featured = [
    { name: 'Amul Taaza Toned Fresh Milk', weight: '500 ml', price: 27, oldPrice: 30 },
    { name: 'Nandini GoodLife Toned Milk', weight: '500 ml', price: 28 },
    { name: 'Farm Fresh Tomatoes (Hybrid)', weight: '500 g', price: 18, oldPrice: 24, isAd: true },
    { name: 'Onion (Medium Size)', weight: '1 kg', price: 45, oldPrice: 60 },
    { name: 'Potato (Aloo)', weight: '1 kg', price: 35, oldPrice: 40 },
    { name: 'Coriander (Dhaniya)', weight: '100 g', price: 15, oldPrice: 20 },
  ];

  return (
    <main className={`min-h-screen bg-white ${deviceType === 'mobile' ? 'pb-20' : ''}`}>
      <Header deviceType={deviceType} />

      <div className={`
         ${deviceType === 'desktop' ? 'max-w-[1280px] mx-auto px-4 lg:px-0 pt-6 space-y-10' : 'space-y-4 pt-4'}
      `}>

        {/* Hero Banner Area */}
        <section className={`${deviceType === 'mobile' ? 'px-4' : ''}`}>
          <FestivalBanner />
          {/* In Blinkit desktop this is usually big carousels */}
        </section>

        {/* Categories */}
        <section className={`${deviceType === 'mobile' ? 'px-4' : ''}`}>
          {!deviceType || deviceType === 'desktop' && (
            <div className="flex items-center gap-4 mb-6">
              {/* Desktop often has visual breaks */}
            </div>
          )}
          <CategoryGrid />
        </section>

        {/* Products Row 1 */}
        <section className={`${deviceType === 'mobile' ? 'pl-4' : ''}`}>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="font-extrabold text-xl text-slate-800">Buy Fresh Vegetables Online</h2>
            {deviceType === 'desktop' && <a href="/category/vegetables" className="text-brand font-bold cursor-pointer hover:underline">see all</a>}
          </div>

          <div className={`
                flex gap-4 
                ${deviceType === 'mobile' ? 'overflow-x-auto no-scrollbar pb-2' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}
             `}>
            {featured.map((item, i) => (
              <div key={i} className={`${deviceType === 'mobile' ? 'min-w-[140px] w-[140px]' : 'w-full'}`}>
                <ProductCard {...item} />
              </div>
            ))}
          </div>
        </section>

        {/* Products Row 2 */}
        <section className={`${deviceType === 'mobile' ? 'pl-4' : ''}`}>
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="font-extrabold text-xl text-slate-800">Dairy, Bread & Eggs</h2>
            {deviceType === 'desktop' && <span className="text-brand font-bold cursor-pointer">see all</span>}
          </div>

          <div className={`
                flex gap-4 
                ${deviceType === 'mobile' ? 'overflow-x-auto no-scrollbar pb-2' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}
             `}>
            {featured.slice(0, 4).map((item, i) => (
              <div key={i} className={`${deviceType === 'mobile' ? 'min-w-[140px] w-[140px]' : 'w-full'}`}>
                <ProductCard {...item} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
