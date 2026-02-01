'use client';
import { createClient } from '@/lib/supabase';
import { User, LogOut, Package, MapPin, ChevronRight, Settings, CreditCard, Bell, Shield, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ModernHeader from '@/components/ui/ModernHeader';

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
            } else {
                router.push('/login');
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <OrdersView user={user} />;
            case 'addresses':
                return <AddressesView />;
            case 'payments':
                return <PaymentsView />;
            case 'notifications':
                return <NotificationsView />;
            case 'profile':
                return <ProfileView user={user} />;
            case 'security':
                return <SecurityView />;
            case 'privacy':
                return <PrivacyView />;
            default:
                return <OrdersView user={user} />;
        }
    };

    const MenuLink = ({ icon: Icon, label, id, subtext }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border border-transparent text-left ${activeTab === id ? 'bg-brand/5 border-brand/10 shadow-sm' : 'hover:bg-slate-50 hover:border-slate-100'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <span className={`font-bold block ${activeTab === id ? 'text-brand-dark' : 'text-slate-700'}`}>{label}</span>
                    {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
                </div>
            </div>
            <ChevronRight size={18} className={`text-slate-300 ${activeTab === id ? 'text-brand' : ''}`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <ModernHeader deviceType="desktop" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-8 hidden lg:block">My Account</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center lg:text-left relative overflow-hidden group">

                            <div className="flex flex-col items-center lg:items-start gap-4 z-10 relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-brand to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg border-4 border-white ring-1 ring-slate-100 overflow-hidden">
                                    {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" /> : user.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
                                    <p className="text-xs text-slate-500 break-all mb-2">{user.email}</p>
                                    <button onClick={() => setActiveTab('profile')} className="text-xs font-bold text-brand hover:underline">Edit Profile</button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions (Mobile Only) */}
                        <div className="lg:hidden grid grid-cols-2 gap-4">
                            <Link href="/orders" className="bg-white p-4 rounded-xl text-center shadow-sm border border-slate-100">
                                <Package className="mx-auto text-brand mb-2" />
                                <span className="font-bold text-slate-700 text-sm">Orders</span>
                            </Link>
                            <div className="bg-white p-4 rounded-xl text-center shadow-sm border border-slate-100 opacity-50">
                                <MapPin className="mx-auto text-blue-500 mb-2" />
                                <span className="font-bold text-slate-700 text-sm">Address</span>
                            </div>
                        </div>

                        {/* Navigation Menu (Desktop) */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-4 space-y-1">
                                <MenuLink icon={Package} label="My Orders" id="orders" subtext="Track & Return" />
                                <MenuLink icon={User} label="My Profile" id="profile" subtext="Edit Details" />
                                <MenuLink icon={Lock} label="Security" id="security" subtext="Change Password" />
                                <MenuLink icon={MapPin} label="Addresses" id="addresses" subtext="Manage Delivery" />
                                <MenuLink icon={CreditCard} label="Payments" id="payments" subtext="Saved Cards & UPI" />
                                <MenuLink icon={Bell} label="Notifications" id="notifications" />
                                <MenuLink icon={Shield} label="Privacy & Settings" id="privacy" />
                            </div>
                            <div className="p-4 border-t border-slate-100">
                                <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 font-bold hover:bg-red-50 p-3 rounded-xl w-full transition-colors">
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[600px] p-8">
                            {renderContent()}
                        </div>
                    </div>

                    {/* Mobile Menu List */}
                    <div className="lg:hidden space-y-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <Link href="/orders" className="flex items-center gap-3 p-4 border-b border-slate-50">
                                <Package size={20} className="text-brand" /> <span className="flex-1 font-bold text-slate-700">My Orders</span> <ChevronRight size={16} className="text-slate-300" />
                            </Link>
                            <button onClick={() => setActiveTab('profile')} className="w-full flex items-center gap-3 p-4 border-b border-slate-50 text-left">
                                <User size={20} className="text-purple-500" /> <span className="flex-1 font-bold text-slate-700">My Profile</span> <ChevronRight size={16} className="text-slate-300" />
                            </button>
                            <button onClick={() => setActiveTab('security')} className="w-full flex items-center gap-3 p-4 border-b border-slate-50 text-left">
                                <Lock size={20} className="text-slate-500" /> <span className="flex-1 font-bold text-slate-700">Security</span> <ChevronRight size={16} className="text-slate-300" />
                            </button>
                            <div className="flex items-center gap-3 p-4 border-b border-slate-50 opacity-50">
                                <MapPin size={20} className="text-blue-500" /> <span className="flex-1 font-bold text-slate-700">Address Book</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full bg-white text-red-600 font-bold p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center gap-2">
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function ProfileView({ user }: { user: any }) {
    const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
    const [phone, setPhone] = useState(user.user_metadata?.phone || '');
    const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleUpdate = async () => {
        setLoading(true);
        const updates: any = {
            data: { full_name: fullName, phone, avatar_url: avatarUrl }
        };

        const { error } = await supabase.auth.updateUser(updates);
        setLoading(false);
        if (error) {
            alert(error.message);
        } else {
            alert('Profile updated successfully!');
            window.location.reload(); // Refresh to see changes
        }
    };

    const handleAvatarUpload = async (event: any) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload file
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><User className="text-purple-500" /> Edit Profile</h2>

            <div className="space-y-6">
                {/* Email (Read Only) */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed.</p>
                </div>

                {/* Avatar Upload */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 relative">
                            {avatarUrl ? (
                                <img src={avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={32} /></div>
                            )}
                            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">...</div>}
                        </div>
                        <div>
                            <label className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-slate-50 transition-colors shadow-sm inline-block">
                                {uploading ? 'Uploading...' : 'Choose Image'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max 1MB.</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Rahul Sharma"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="+91 98765 43210"
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleUpdate}
                        disabled={loading || uploading}
                        className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-brand/20 w-full md:w-auto"
                    >
                        {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SecurityView() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            alert("Please fill in both password fields.");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setLoading(false);

        if (error) {
            alert(error.message);
        } else {
            setNewPassword('');
            setConfirmPassword('');
            alert('Password updated successfully!');
        }
    };

    return (
        <div className="max-w-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Lock className="text-slate-700" /> Change Password</h2>

            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                    <p className="text-xs text-yellow-800">
                        <b>Note:</b> Choose a strong password to keep your account secure.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="Enter new password"
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                        placeholder="Re-enter new password"
                        minLength={6}
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handlePasswordChange}
                        disabled={loading}
                        className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 shadow-lg w-full md:w-auto"
                    >
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function OrdersView({ user }: { user: any }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const supabase = createClient();
    const PAGE_SIZE = 5;

    const fetchOrders = async (pageIndex: number, isNew: boolean = false) => {
        if (!user) return;

        if (isNew) setLoading(true);
        else setLoadingMore(true);

        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name, image))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (data) {
            setOrders(prev => isNew ? data : [...prev, ...data]);
            if (data.length < PAGE_SIZE) setHasMore(false);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchOrders(0, true);
    }, [user]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOrders(nextPage);
    };

    if (loading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-slate-50 rounded-xl animate-pulse" />)}</div>;

    if (orders.length === 0) return (
        <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
            <h3 className="font-bold text-slate-800">No orders yet</h3>
            <p className="text-slate-500 text-sm mb-6">Order something delicious today!</p>
            <Link href="/" className="bg-brand text-white px-6 py-2 rounded-lg font-bold text-sm">Shop Now</Link>
        </div>
    );

    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Package className="text-brand" /> My Orders</h2>
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order.id} className="border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">Order #{order.id.slice(0, 8)}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-sky-100 text-sky-700'}`}>{order.status}</span>
                            </div>
                            <div className="flex gap-2 mb-4 overflow-hidden">
                                {order.order_items?.slice(0, 5).map((item: any) => (
                                    <div key={item.id} className="w-10 h-10 bg-slate-50 rounded border border-slate-100 flex items-center justify-center">
                                        {item.products?.image ? <img src={item.products.image} className="w-full h-full object-cover rounded" /> : '🥗'}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between min-w-[120px]">
                            <span className="font-bold text-lg text-slate-800">₹{order.total_amount}</span>
                            <Link href={`/orders/${order.id}`} className="text-brand text-sm font-bold hover:underline">View Details</Link>
                        </div>
                    </div>
                ))}

                {/* LOAD MORE BUTTON */}
                {hasMore && (
                    <div className="pt-4 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="text-slate-500 font-bold text-sm hover:text-brand disabled:opacity-50 transition-colors"
                        >
                            {loadingMore ? 'Loading...' : 'Load Older Orders'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function AddressesView() {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><MapPin className="text-blue-500" /> Saved Addresses</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="border border-brand bg-brand/5 rounded-xl p-6 relative">
                    <span className="absolute top-4 right-4 bg-brand text-white text-[10px] uppercase font-bold px-2 py-1 rounded">Default</span>
                    <h3 className="font-bold text-slate-800 mb-1">Home</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">12, Green Park, Civil Lines,<br />New Delhi - 1100xx</p>
                    <p className="text-xs text-slate-500 font-bold">Ph: +91 98765 43210</p>
                    <div className="mt-4 pt-4 border-t border-brand/10 flex gap-4 text-sm font-bold text-brand">
                        <button>Edit</button>
                        <button className="text-red-500">Delete</button>
                    </div>
                </div>
                <button className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand hover:text-brand hover:bg-slate-50 transition-all">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 text-2xl">+</div>
                    <span className="font-bold text-sm">Add New Address</span>
                </button>
            </div>
        </div>
    )
}

function PaymentsView() {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard className="text-purple-500" /> Payment Methods</h2>
            <div className="space-y-4 max-w-lg">
                <div className="flex items-center gap-4 border border-slate-200 p-4 rounded-xl">
                    <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-xs">VISA</div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-700 text-sm">HDFC Bank Credit Card</p>
                        <p className="text-xs text-slate-400">Ending in 4242</p>
                    </div>
                    <button className="text-red-500 text-xs font-bold">Remove</button>
                </div>
                <div className="flex items-center gap-4 border border-slate-200 p-4 rounded-xl">
                    <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs">UPI</div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-700 text-sm">Google Pay</p>
                        <p className="text-xs text-slate-400">user@oksbi</p>
                    </div>
                    <button className="text-red-500 text-xs font-bold">Remove</button>
                </div>
            </div>
        </div>
    )
}

function NotificationsView() {
    return (
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Bell className="text-orange-500" /> Notifications</h2>
            <div className="bg-slate-50 p-4 rounded-xl text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
            </div>
        </div>
    )
}

function PrivacyView() {
    return (
        <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Shield className="text-slate-500" /> Privacy & Settings</h2>

            <h3 className="text-lg font-bold">Privacy Policy</h3>
            <p className="text-sm text-slate-600">
                At VegFrash, we take your privacy seriously. We only collect information necessary to process your orders and improve your shopping experience.
                We do not sell your personal data to third parties.
            </p>

            <h3 className="text-lg font-bold mt-6">Account Settings</h3>
            <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <p className="font-bold text-sm text-slate-800">Email Notifications</p>
                        <p className="text-xs text-slate-500">Receive order updates and offers</p>
                    </div>
                    <div className="w-10 h-6 bg-brand rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <p className="font-bold text-sm text-slate-800">SMS Notifications</p>
                        <p className="text-xs text-slate-500">Receive delivery updates via SMS</p>
                    </div>
                    <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div></div>
                </div>
            </div>
            <button className="mt-8 text-red-600 text-sm font-bold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">Delete Account</button>
        </div>
    )
}
