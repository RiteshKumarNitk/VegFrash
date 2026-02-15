'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import AddAddressForm from './AddAddressForm';

export default function AddressSelector({ onSelect, selectedId }: { onSelect: (id: string, details: any) => void, selectedId: string | null }) {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const supabase = createClient();

    const fetchAddresses = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('customer_addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (data) setAddresses(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    if (isAdding) {
        return <AddAddressForm onCancel={() => setIsAdding(false)} onSuccess={() => { setIsAdding(false); fetchAddresses(); }} />;
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Delivery Address</h3>
                <button onClick={() => setIsAdding(true)} className="text-sm text-brand font-bold hover:underline">+ Add New</button>
            </div>

            {loading ? (
                <div className="text-sm text-slate-400">Loading addresses...</div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No saved addresses. Adds one to proceed.
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map(addr => (
                        <div
                            key={addr.id}
                            onClick={() => onSelect(addr.id, addr)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedId === addr.id ? 'border-brand bg-emerald-50 ring-1 ring-brand' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <div className="mt-1 text-lg">
                                {addr.address_label === 'Home' ? '🏠' : addr.address_label === 'Work' ? '🏢' : '📍'}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{addr.address_label} <span className="font-normal text-slate-500">- {addr.receiver_name}</span></h4>
                                <p className="text-xs text-slate-600 leading-tight mt-1">
                                    {addr.full_address_text}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{addr.receiver_phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
