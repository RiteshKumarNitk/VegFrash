import { createClient } from "@supabase/supabase-js";
import ExploreView from "@/components/ui/ExploreView";
import ModernHeader from "@/components/ui/ModernHeader";
import { getDeviceType } from "@/lib/device";

export const revalidate = 0; // Ensure fresh data

export default async function ExplorePage() {
    const deviceType = await getDeviceType();

    // Server-side fetch
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_visible', true).order('created_at'),
        supabase.from('categories').select('*').order('name')
    ]);

    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];

    return (
        <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
            <ModernHeader deviceType={deviceType} />
            <ExploreView products={products} categories={categories} />
        </div>
    );
}
