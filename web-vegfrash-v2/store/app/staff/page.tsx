'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import {
    Users, Plus, Mail, Shield,
    Phone, BadgeCheck, X, Loader2,
    Trash2, Edit3, UserCheck, AlertCircle,
    Truck
} from 'lucide-react';
import { toast } from 'sonner';

type StaffMember = {
    id: string;
    full_name: string;
    role: 'admin' | 'packer' | 'delivery';
    phone: string;
    is_active: boolean;
    created_at: string;
    email?: string; // Opt
};

export default function StaffPage() {
    const supabase = createClient();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        role: 'packer',
        phone: '',
        is_active: true
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('staff_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setStaff(data as any);
        if (error) toast.error(error.message);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('staff_profiles').insert([formData]);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Staff member added successfully');
            setIsAdding(false);
            fetchStaff();
            setFormData({ full_name: '', role: 'packer', phone: '', is_active: true });
        }
    };

    const toggleActive = async (id: string, current: boolean) => {
        const { error } = await supabase.from('staff_profiles').update({ is_active: !current }).eq('id', id);
        if (error) toast.error(error.message);
        else fetchStaff();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this staff profile?')) return;
        const { error } = await supabase.from('staff_profiles').delete().eq('id', id);
        if (error) toast.error(error.message);
        else fetchStaff();
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'packer': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'delivery': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="text-emerald-600" size={32} />
                        Team & Staff
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage roles and permissions for your operations team.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open('/rider', '_blank')}
                        className="bg-white text-slate-900 border-2 border-slate-100 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Truck size={20} className="text-emerald-500" /> Rider Terminal
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                        <Plus size={20} /> Add Member
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Staff</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900">{staff.length}</span>
                        <span className="text-emerald-600 font-bold mb-1">Active Members</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Operation Roles</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold border border-purple-100 uppercase">Admins ({staff.filter(s => s.role === 'admin').length})</span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100 uppercase">Packers ({staff.filter(s => s.role === 'packer').length})</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Delivery Squad</p>
                    <div className="flex items-center gap-2 mt-2 text-amber-600 font-black">
                        <Truck size={20} />
                        <span>{staff.filter(s => s.role === 'delivery').length} Online Partners</span>
                    </div>
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-100 shadow-2xl animate-scale-in">
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">New Team Member</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                        placeholder="Enter name"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                        placeholder="+91"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Role & Access</h3>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Role</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="packer">Packer / Ops</option>
                                    <option value="delivery">Delivery Partner</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-2xl p-4 font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">Add Staff</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Staff List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Info</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Joined</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <Loader2 className="animate-spin text-emerald-600 mx-auto" size={40} />
                                    <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Loading Staff...</p>
                                </td>
                            </tr>
                        ) : staff.map(member => (
                            <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors ${!member.is_active && 'opacity-60 grayscale'}`}>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-100 shadow-inner">
                                            {member.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{member.full_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <Phone size={12} className="text-slate-300" /> {member.phone || 'No Phone'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleBadge(member.role)}`}>
                                        {member.role}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <button
                                        onClick={() => toggleActive(member.id, member.is_active)}
                                        className={`flex items-center gap-2 text-xs font-bold ${member.is_active ? 'text-emerald-600' : 'text-slate-400'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                        {member.is_active ? 'Available' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="p-6 text-xs font-bold text-slate-500">
                                    {new Date(member.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && staff.length === 0 && (
                    <div className="p-20 text-center">
                        <Users size={64} className="mx-auto text-slate-100 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">No staff members found</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm font-medium">Add your first team member to start managing operations.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 shrink-0">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Advanced RBAC (Role-Based Access Control)</h4>
                    <p className="text-xs text-amber-800/80 leading-relaxed max-w-3xl">
                        Packers only see confirmed orders awaiting fulfillment. Delivery Partners only see orders assigned to them with customer locations. Admins maintain full visibility.
                    </p>
                </div>
            </div>
        </div>
    );
}
