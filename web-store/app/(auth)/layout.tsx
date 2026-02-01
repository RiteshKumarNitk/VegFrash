export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-slate-900">
            {children}
        </div>
    );
}
