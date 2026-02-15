
'use client';

import { createClient } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const supabase = createClient();

export default function TestDB() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function run() {
            // 1. Fetch Categories
            const { data: cats, error: errC } = await supabase.from('categories').select('*');

            // 2. Fetch Products
            const { data: prods, error: errP } = await supabase.from('products').select('*, categories(slug, name)');

            if (errC || errP) setError({ cats: errC, prods: errP });
            setData({ cats, prods });
        }
        run();
    }, []);

    if (error) return <pre className="text-red-500">{JSON.stringify(error, null, 2)}</pre>;
    if (!data) return <div>Loading...</div>;

    return (
        <div className="p-10 font-mono text-xs">
            <h1 className="text-xl font-bold mb-4">Debug Console</h1>

            <div className="grid grid-cols-2 gap-10">
                <div>
                    <h2 className="text-lg font-bold bg-gray-100 p-2">Categories Table</h2>
                    <pre>{JSON.stringify(data.cats, null, 2)}</pre>
                </div>
                <div>
                    <h2 className="text-lg font-bold bg-gray-100 p-2">Products Table</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-1">Name</th>
                                <th className="p-1">Stock</th>
                                <th className="p-1">Reserved</th>
                                <th className="p-1">Visible?</th>
                                <th className="p-1">Cat Slug</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.prods?.map((p: any) => (
                                <tr key={p.id} className="border-b hover:bg-yellow-50">
                                    <td className="p-1">{p.name}</td>
                                    <td className="p-1">{p.total_stock}</td>
                                    <td className="p-1">{p.reserved_stock}</td>
                                    <td className={`p-1 font-bold ${p.is_visible ? 'text-green-600' : 'text-red-600'}`}>
                                        {String(p.is_visible)}
                                    </td>
                                    <td className="p-1">{p.categories?.slug}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
