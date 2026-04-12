import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading]         = useState(true);
    const [isAdmin, setIsAdmin]         = useState(false);

    // Listen to Firebase auth state on mount
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
                    setIsAdmin(adminSnap.exists());
                } catch {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const signIn = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const signUp = async (email, password, displayName) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(cred.user, { displayName });
        }
        return cred;
    };

    const signOut = () => firebaseSignOut(auth);

    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    // Show nothing while Firebase resolves the initial auth state (prevents flash)
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg)' }}
            >
                <div className="flex flex-col items-center gap-4">
                    <svg
                        className="w-8 h-8 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ color: '#d4af37' }}
                    >
                        <circle className="opacity-20" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-80" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="font-sans text-xs uppercase tracking-widest"
                        style={{ color: 'var(--text-subtle)' }}>
                        Loading…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ currentUser, loading, isAdmin, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}
