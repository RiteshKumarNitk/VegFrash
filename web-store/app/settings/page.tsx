'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Store, Clock, ShieldCheck, Bell, CreditCard, Palette,
    Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState('store');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [fetchError, setFetchError] = useState<any>(null);
    const [rawData, setRawData] = useState<any>(null);

    // Settings Data State
    const [settings, setSettings] = useState<any>({
        profile: { name: '', phone: '', email: '', status: 'open' },
        hours: { open: '08:00', close: '22:00', holidays: false },
        rules: { sla: 15, min_order: 100, delivery_msg: 'Delivery in 10 minutes', delivery_fee: 25, free_delivery_above: 99, handling_fee: 2 },
        notifications: { email: true, push: true },
        theme: {
            festival_mode: false,
            banner_text: 'GRAND FESTIVAL SALE IS LIVE! Get Flat 50% OFF',
            promo_code: 'FEST50',
            gradient: 'from-orange-500 via-red-500 to-yellow-500'
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);

        // Check User
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch Data
        const { data, error } = await supabase.from('site_settings').select('*');
        setRawData(data);

        if (error) {
            console.error('Fetch error:', error);
            setFetchError(error);
        }

        if (data) {
            const newSettings: any = { ...settings };
            data.forEach((row: any) => {
                // Safety: Parse value if it comes as a string (common if DB column is 'text' instead of 'jsonb')
                let parsedValue = row.value;
                if (typeof row.value === 'string') {
                    try {
                        parsedValue = JSON.parse(row.value);
                    } catch (e) {
                        console.error(`Failed to parse setting ${row.key}:`, e);
                        parsedValue = {};
                    }
                }

                if (row.key === 'store_profile') newSettings.profile = { ...newSettings.profile, ...parsedValue };
                if (row.key === 'operating_hours') newSettings.hours = { ...newSettings.hours, ...parsedValue };
                if (row.key === 'order_rules') newSettings.rules = { ...newSettings.rules, ...parsedValue };
                if (row.key === 'theme_config') newSettings.theme = { ...newSettings.theme, ...parsedValue };
            });
            setSettings(newSettings);
        }

        // --- DEBUG LOGS ---
        console.log('[Settings] Auth User:', user?.email || 'Guest');
        console.log('[Settings] DB Fetch Error:', error);
        console.log('[Settings] DB Rows:', data?.length);
        // ------------------

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const updates = [
            { key: 'store_profile', value: settings.profile },
            { key: 'operating_hours', value: settings.hours },
            { key: 'order_rules', value: settings.rules },
            { key: 'theme_config', value: settings.theme },
        ];

        try {
            // Use bulk save RPC for efficiency and to avoid parallel connection timeouts
            const { error } = await supabase.rpc('save_site_settings_bulk', {
                settings: updates
            });

            if (error) {
                console.warn('Bulk save error, attempting fallback:', error);

                // Fallback to individual saves for ANY error (RPC missing, timeout, or connection issue)
                console.log('Falling back to sequential saves...');
                let hasError = false;
                for (const update of updates) {
                    const { error: individualError } = await supabase.rpc('save_site_setting', {
                        setting_key: update.key,
                        setting_value: update.value
                    });
                    if (individualError) {
                        console.error(`Error saving ${update.key}:`, individualError);
                        hasError = true;
                    }
                }
                if (hasError) throw new Error('Some settings failed to save');
            }

            toast.success('Settings saved successfully');
        } catch (error: any) {
            console.error('Save operation failed:', error);
            toast.error(error.message || 'Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Helper to update specific section
    const updateSection = (section: string, key: string, val: any) => {
        setSettings({ ...settings, [section]: { ...settings[section], [key]: val } });
    };

    const tabs = [
        { id: 'store', label: 'Store Profile', icon: Store },
        { id: 'hours', label: 'Operating Hours', icon: Clock },
        { id: 'rules', label: 'Order Rules', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'theme', label: 'Theme & Branding', icon: Palette },
    ];

    if (loading) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

    return (
        <div className="max-w-5xl mx-auto min-h-[80vh] flex flex-col md:flex-row gap-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 shrink-0 space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 px-4">Settings</h1>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative">

                {/* Save Button (Floating) */}
                <div className="absolute top-8 right-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* --- SECTIONS --- */}

                {/* 1. STORE PROFILE */}
                {activeTab === 'store' && (
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Store Profile</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                                <input type="text" value={settings.profile.name} onChange={e => updateSection('profile', 'name', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
                                <input type="text" value={settings.profile.phone} onChange={e => updateSection('profile', 'phone', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Support Email</label>
                                <input type="email" value={settings.profile.email} onChange={e => updateSection('profile', 'email', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Current Status</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 py-3 border-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${settings.profile.status === 'open' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-gray-100'}`}>
                                        <input type="radio" checked={settings.profile.status === 'open'} onChange={() => updateSection('profile', 'status', 'open')} className="hidden" />
                                        <span>🟢 Open</span>
                                    </label>
                                    <label className={`flex-1 py-3 border-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${settings.profile.status === 'closed' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-100'}`}>
                                        <input type="radio" checked={settings.profile.status === 'closed'} onChange={() => updateSection('profile', 'status', 'closed')} className="hidden" />
                                        <span>🔴 Closed</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. OPERATING HOURS */}
                {activeTab === 'hours' && (
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Operating Hours</h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Open Time</label>
                                <input type="time" value={settings.hours.open} onChange={e => updateSection('hours', 'open', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Close Time</label>
                                <input type="time" value={settings.hours.close} onChange={e => updateSection('hours', 'close', e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <div className="font-bold text-gray-800">Holiday Mode</div>
                                <div className="text-xs text-gray-500">Temporarily close store for holiday</div>
                            </div>
                            <button
                                onClick={() => updateSection('hours', 'holidays', !settings.hours.holidays)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.hours.holidays ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.hours.holidays ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. ORDER RULES */}
                {activeTab === 'rules' && (
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Order Rules</h2>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Target SLA (Minutes)</label>
                            <div className="flex items-center gap-3">
                                <input type="number" value={settings.rules.sla ?? 15} onChange={e => updateSection('rules', 'sla', parseInt(e.target.value))} className="w-24 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none font-mono font-bold" />
                                <span className="text-sm text-gray-500">mins delivery target</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Order Value (₹)</label>
                            <div className="flex items-center gap-3">
                                <input type="number" value={settings.rules.min_order ?? 0} onChange={e => updateSection('rules', 'min_order', parseInt(e.target.value))} className="w-24 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none font-mono font-bold" />
                                <span className="text-sm text-gray-500">to place an order</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Standard Delivery Fee (₹)</label>
                                <input type="number" value={settings.rules.delivery_fee ?? 0} onChange={e => updateSection('rules', 'delivery_fee', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Free Delivery Above (₹)</label>
                                <input type="number" value={settings.rules.free_delivery_above ?? 0} onChange={e => updateSection('rules', 'free_delivery_above', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Handling/Platform Fee (₹)</label>
                                <input type="number" value={settings.rules.handling_fee ?? 0} onChange={e => updateSection('rules', 'handling_fee', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Promise Message</label>
                            <p className="text-xs text-gray-400 mb-2">This text appears on the checkout/cart page.</p>
                            <input
                                type="text"
                                value={settings.rules.delivery_msg || ''}
                                onChange={e => updateSection('rules', 'delivery_msg', e.target.value)}
                                placeholder="e.g., Delivery in 10 minutes"
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* 4. NOTIFICATIONS (MOCK) */}
                {activeTab === 'notifications' && (
                    <div className="max-w-lg space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Notifications</h2>
                        <p className="text-gray-400 italic">Configure alert channels here (Coming soon).</p>
                    </div>
                )}

                {/* 5. THEME & BRANDING */}
                {activeTab === 'theme' && (
                    <div className="max-w-lg space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Theme & Branding</h2>

                            {/* Standard Banner Config */}
                            <div className="space-y-4 mb-8">
                                <h3 className="font-bold text-gray-700">Standard Homepage Banner</h3>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Headline Text</label>
                                    <input
                                        type="text"
                                        value={settings.theme.standard_title || 'Freshness Delivered Fast.'}
                                        onChange={e => updateSection('theme', 'standard_title', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none"
                                        placeholder="e.g. Freshness Delivered Fast."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">Subtitle Text</label>
                                    <textarea
                                        value={settings.theme.standard_subtitle || 'Get farm-fresh vegetables and daily essentials delivered into your doorstep in 10 minutes.'}
                                        onChange={e => updateSection('theme', 'standard_subtitle', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none h-20 resize-none"
                                        placeholder="e.g. Get farm-fresh vegetables..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Festival Mode Section */}
                        <div className="border-t border-gray-100 pt-6">
                            {/* Festival Mode Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                                <div>
                                    <div className="font-bold text-gray-800">Festival Mode</div>
                                    <div className="text-xs text-gray-500">Enable special holiday theme & animations</div>
                                </div>
                                <button
                                    onClick={() => updateSection('theme', 'festival_mode', !settings.theme.festival_mode)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.theme.festival_mode ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.theme.festival_mode ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>

                            {settings.theme.festival_mode && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 mb-4">
                                        <strong>Note:</strong> When active, this overrides the standard banner.
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Festival Headline</label>
                                        <input
                                            type="text"
                                            value={settings.theme.banner_text}
                                            onChange={e => updateSection('theme', 'banner_text', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none"
                                            placeholder="e.g. GRAND FESTIVAL SALE IS LIVE!"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Promo Code</label>
                                        <input
                                            type="text"
                                            value={settings.theme.promo_code}
                                            onChange={e => updateSection('theme', 'promo_code', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 outline-none uppercase font-mono"
                                            placeholder="e.g. FEST50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Banner Style</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Sunset (Orange/Red)', value: 'from-orange-500 via-red-500 to-yellow-500' },
                                                { label: 'Ocean (Blue/Cyan)', value: 'from-blue-600 via-cyan-500 to-teal-400' },
                                                { label: 'Forest (Green/Emerald)', value: 'from-emerald-600 via-green-500 to-lime-500' },
                                                { label: 'Berry (Purple/Pink)', value: 'from-purple-600 via-pink-500 to-rose-500' },
                                                { label: 'Midnight (Dark)', value: 'from-slate-900 via-slate-800 to-slate-900' },
                                            ].map((style) => (
                                                <button
                                                    key={style.value}
                                                    onClick={() => updateSection('theme', 'gradient', style.value)}
                                                    className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${settings.theme.gradient === style.value ? 'border-gray-800 scale-[1.02] shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                                >
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${style.value}`}></div>
                                                    <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-md">{style.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}



            </div>
        </div>
    );
}
