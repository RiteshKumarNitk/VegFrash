'use client';

import { useState } from 'react';
import { Delete, Check } from 'lucide-react';

interface PickingInterfaceProps {
    item: any;
    onConfirm: (weight: number) => void;
    onCancel: () => void;
}

export default function PickingInterface({ item, onConfirm, onCancel }: PickingInterfaceProps) {
    const [inputVal, setInputVal] = useState('');

    const handleNumClick = (num: string) => {
        if (inputVal.includes('.') && num === '.') return;
        setInputVal(prev => prev + num);
    };

    const handleDelete = () => {
        setInputVal(prev => prev.slice(0, -1));
    };

    const handleConfirm = () => {
        const weight = parseFloat(inputVal);
        if (!isNaN(weight) && weight > 0) {
            onConfirm(weight);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Weigh Item</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="p-6 text-center">
                    <p className="text-sm text-slate-500 mb-1">Enter actual weight for</p>
                    <h4 className="text-xl font-bold text-slate-800 mb-4">{item.name}</h4>

                    <div className="flex justify-center items-end gap-2 mb-6">
                        <span className="text-5xl font-bold text-emerald-600 tracking-tighter">
                            {inputVal || '0.000'}
                        </span>
                        <span className="text-slate-400 font-bold mb-1">kg</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumClick(num.toString())}
                                className="h-14 rounded-xl bg-slate-100 text-slate-700 font-bold text-xl hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleDelete}
                            className="h-14 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <Delete size={20} />
                        </button>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={!inputVal}
                        className="w-full mt-6 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                        <Check size={20} />
                        Confirm Weight
                    </button>
                </div>
            </div>
        </div>
    );
}
