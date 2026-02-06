'use client';
import ModernHeader from '@/components/ui/ModernHeader';
import Footer from '@/components/ui/Footer';
import { Mail, Phone, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-slate-50/50">
            <ModernHeader deviceType="mobile" />

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-4">How can we help?</h1>
                    <p className="text-slate-500 max-w-xl mx-auto">We're here to assist you with any questions about your orders, products, or our service.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-brand/10 rounded-2xl text-brand">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Phone Support</h3>
                                    <p className="text-sm text-slate-500">+91 98765-43210</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Email Us</h3>
                                    <p className="text-sm text-slate-500">support@vegfrash.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Support Hours</h3>
                                    <p className="text-sm text-slate-500">6 AM - 11 PM Everyday</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <MessageSquare size={120} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                            <p className="text-sm text-brand-light mb-6">Talk to our customer happiness team instantly for quicker resolution.</p>
                            <button className="bg-white text-brand px-6 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-all">Start Chat</button>
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-800 mb-8">Send us a message</h2>
                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our team will get back to you soon.'); }}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium appearance-none">
                                        <option>Order Inquiries</option>
                                        <option>Product Feedback</option>
                                        <option>Delivery Issues</option>
                                        <option>Partnership/Business</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                                    <textarea rows={5} placeholder="How can we help you today?" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium resize-none" required></textarea>
                                </div>
                                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">Send My Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
