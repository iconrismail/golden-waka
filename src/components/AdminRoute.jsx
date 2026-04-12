import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
    const { currentUser, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080808' }}>
                <div className="flex flex-col items-center gap-4">
                    <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: '#d4af37' }}>
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="font-sans text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Verifying access…
                    </p>
                </div>
            </div>
        );
    }

    if (!currentUser) return <Navigate to="/login" replace />;
    if (!isAdmin)     return <Navigate to="/dashboard" replace />;

    return children;
}
