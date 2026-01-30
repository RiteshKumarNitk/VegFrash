'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AddAddressForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const [box, setBox] = useState({
        house_flat_no: '',
        apartment_road_area: '',
        landmark: '',
        receiver_name: '',
        receiver_phone: ''
    });
    const [label, setLabel] = useState('Home');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // Mock Lat/Long for Demo (Bangalore Koramangala)
            // In real app, we would use a Map picker
            const mockLat = 12.9352;
            const mockLng = 77.6245;

            const { error } = await supabase.from('customer_addresses').insert({
                user_id: user.id,
                house_flat_no: box.house_flat_no,
                apartment_road_area: box.apartment_road_area,
                landmark: box.landmark,
                receiver_name: box.receiver_name,
                receiver_phone: box.receiver_phone,
                address_label: label,
                full_address_text: `${box.house_flat_no}, ${box.apartment_road_area}, ${box.landmark}`,
                // Insert as GeoJSON or WKT if PostGIS is enabled, specific syntax depends on setup. 
                // Using a fallback raw query usually safest for PostGIS, but let's try standard Supabase GIS insert if supported, 
                // or just standard points. 
                // NOTE: 'lat_long' is GEOMETRY(Point, 4326). Supabase client might expect WKT.
                lat_long: `POINT(${mockLng} ${mockLat})`
            });

            if (error) throw error;
            onSuccess();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in">
            <h3 className="font-bold text-slate-800 mb-4">Add New Address</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    required placeholder="Receiver Name (e.g. Rahul)"
                    className="w-full p-2 border rounded text-sm"
                    value={box.receiver_name}
                    onChange={e => setBox({ ...box, receiver_name: e.target.value })}
                />
                <input
                    required placeholder="Receiver Phone"
                    className="w-full p-2 border rounded text-sm"
                    value={box.receiver_phone}
                    onChange={e => setBox({ ...box, receiver_phone: e.target.value })}
                />
                <div className="flex gap-2">
                    <input
                        required placeholder="Flat / House No"
                        className="flex-1 p-2 border rounded text-sm"
                        value={box.house_flat_no}
                        onChange={e => setBox({ ...box, house_flat_no: e.target.value })}
                    />
                    <input
                        placeholder="Floor"
                        className="w-20 p-2 border rounded text-sm"
                    />
                </div>
                <input
                    required placeholder="Apartment / Road / Area"
                    className="w-full p-2 border rounded text-sm"
                    value={box.apartment_road_area}
                    onChange={e => setBox({ ...box, apartment_road_area: e.target.value })}
                />
                <input
                    placeholder="Landmark (Optional)"
                    className="w-full p-2 border rounded text-sm"
                    value={box.landmark}
                    onChange={e => setBox({ ...box, landmark: e.target.value })}
                />

                <div className="flex gap-2 mt-2">
                    {['Home', 'Work', 'Other'].map(l => (
                        <button
                            key={l} type="button"
                            onClick={() => setLabel(l)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${label === l ? 'bg-brand text-white border-brand' : 'bg-white text-slate-600 border-slate-300'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 mt-4">
                    <button type="button" onClick={onCancel} className="flex-1 py-2 text-slate-500 font-bold text-sm">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-2 bg-brand text-white rounded-lg font-bold text-sm shadow-sm">
                        {loading ? 'Saving...' : 'Save Address'}
                    </button>
                </div>
            </form>
        </div>
    );
}
