'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Save } from 'lucide-react';

export default function ThemesPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('site_settings').select('*');
        if (data) {
            const map: any = {};
            data.forEach((item: any) => map[item.key] = item.value);
            setSettings(map);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        // Upsert all keys
        const updates = Object.keys(settings).map(key => ({
            key,
            value: settings[key],
            updated_at: new Date()
        }));

        const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
        if (error) alert('Error saving: ' + error.message);
        else alert('Theme updated successfully!');
    };

    if (loading) return <div className="p-8">Loading...</div>;

    // Default Fallbacks
    const themePrimary = settings.theme_primary || '#0C831F';
    const bannerGradient = settings.banner_gradient || 'linear-gradient(135deg, #0C831F 0%, #15803d 100%)';
    const bannerTitle = settings.banner_title || 'Freshness Delivered.';

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Theme & Banners</h1>
                    <p className="text-slate-500 text-sm">Customize the look of the customer app.</p>
                </div>
                <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-black font-bold">
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold mb-4 text-lg border-b pb-2">Appearance Settings</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Primary Brand Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    className="h-10 w-20 rounded cursor-pointer"
                                    value={themePrimary}
                                    onChange={(e) => setSettings({ ...settings, theme_primary: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="border rounded p-2 flex-1"
                                    value={themePrimary}
                                    onChange={(e) => setSettings({ ...settings, theme_primary: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Banner Title Text</label>
                            <input
                                className="w-full border rounded p-2"
                                value={bannerTitle}
                                onChange={(e) => setSettings({ ...settings, banner_title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Banner Gradient (CSS)</label>
                            <textarea
                                className="w-full border rounded p-2 h-20 font-mono text-xs"
                                value={bannerGradient}
                                onChange={(e) => setSettings({ ...settings, banner_gradient: e.target.value })}
                            />
                            <p className="text-xs text-slate-400 mt-1">Example: linear-gradient(to right, #ff0000, #0000ff)</p>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 text-sm uppercase">Mobile Preview</h3>
                    <div className="border-[8px] border-slate-800 rounded-[2rem] overflow-hidden bg-slate-50 h-[600px] relative shadow-2xl">
                        {/* Fake Header */}
                        <div className="bg-white p-4 flex justify-between items-center shadow-sm">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: themePrimary }}>V</div>
                            <div className="w-24 h-2 bg-slate-100 rounded-full"></div>
                            <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* Banner Proxy */}
                            <div
                                className="rounded-xl h-40 w-full flex items-center justify-center text-center p-4 text-white shadow-lg relative overflow-hidden"
                                style={{ background: bannerGradient }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                                <h1 className="font-bold text-2xl relative z-10">{bannerTitle}</h1>
                            </div>

                            {/* Fake Categories */}
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-square bg-slate-200 rounded-lg opacity-50"></div>
                                ))}
                            </div>

                            {/* Fake Button */}
                            <div
                                className="w-full h-10 rounded-lg mt-4 flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: themePrimary }}
                            >
                                Checkout
                            </div>
                        </div>

                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-slate-800 rounded-b-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
