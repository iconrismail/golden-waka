import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg)' }}
            >
                <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24"
                    style={{ color: '#d4af37' }}>
                    <circle className="opacity-20" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
