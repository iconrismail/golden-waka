import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ReservationForm from './ReservationForm';
import ProfileSettingsModal from './ProfileSettingsModal';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    Confirmed: '#22c55e',
    Pending:   '#d4af37',
    Planning:  '#60a5fa',
    Cancelled: '#ef4444',
    Completed: '#a855f7',
};

function relativeTime(ts) {
    if (!ts?.toDate) return null;
    const diff = Date.now() - ts.toDate().getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  <  1) return 'just now';
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  <  7) return `${days}d ago`;
    return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(departure, returnDate) {
    const fmt = (str) => {
        if (!str) return '';
        // 'T12:00:00' avoids off-by-one from timezone shifts on date-only strings
        const d = new Date(str + 'T12:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    if (departure && returnDate) return `${fmt(departure)} – ${fmt(returnDate)}`;
    if (departure) return `Departs ${fmt(departure)}`;
    return 'Dates TBC';
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="p-5 rounded-2xl text-center"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
            <p className="font-serif text-3xl mb-1" style={{ color: '#d4af37' }}>{value}</p>
            <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-0.5"
                style={{ color: 'var(--text-primary)' }}>
                {label}
            </p>
            {sub && (
                <p className="font-sans text-[10px]" style={{ color: 'var(--text-subtle)' }}>{sub}</p>
            )}
        </motion.div>
    );
}

function TripSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl animate-pulse"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="w-16 h-16 rounded-xl shrink-0" style={{ backgroundColor: 'var(--border)' }} />
            <div className="flex-1 space-y-2">
                <div className="h-4 rounded-md w-3/4" style={{ backgroundColor: 'var(--border)' }} />
                <div className="h-3 rounded-md w-1/2" style={{ backgroundColor: 'var(--border)' }} />
            </div>
            <div className="w-16 h-6 rounded-full shrink-0" style={{ backgroundColor: 'var(--border)' }} />
        </div>
    );
}

const quickActions = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        label: 'Concierge',
        desc: 'Chat with your advisor',
        to: '/support',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
            </svg>
        ),
        label: 'Destinations',
        desc: 'Browse curated stays',
        to: '/travel',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
        label: 'Availability',
        desc: 'Check open dates',
        to: '/dates',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
        label: 'Journal',
        desc: 'Travel stories & guides',
        to: '/journal',
    },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { currentUser, signOut, isAdmin } = useAuth();
    const toast    = useToast();
    const navigate = useNavigate();

    const [signingOut,   setSigningOut]   = useState(false);
    const [trips,        setTrips]        = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [showReserve,  setShowReserve]  = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // ── Local profile state (updates immediately after ProfileSettingsModal saves) ──
    const [localName,  setLocalName]  = useState(
        currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Traveller'
    );
    const [localPhoto, setLocalPhoto] = useState(currentUser?.photoURL || null);

    const displayName = localName;
    const firstName   = displayName.split(' ')[0];
    const initials    = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase() || '?';
    const memberSince = currentUser?.metadata?.creationTime
        ? new Date(currentUser.metadata.creationTime).getFullYear()
        : '2026';

    // ── Real-time Firestore subscription ──
    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, 'users', currentUser.uid, 'reservations'),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoadingTrips(false);
            },
            (err) => {
                console.error('Trips fetch error:', err);
                setLoadingTrips(false);
            }
        );
        return unsub;
    }, [currentUser]);

    // ── Derived stats ──
    const confirmedCount = trips.filter(t => t.status === 'Confirmed').length;
    const pendingCount   = trips.filter(t => t.status === 'Pending').length;
    const uniqueDests    = new Set(trips.map(t => t.destination)).size;

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut();
            toast({ title: 'Signed out', message: 'See you soon.', type: 'success' });
            navigate('/');
        } catch {
            toast({ title: 'Error', message: 'Could not sign out. Try again.', type: 'error' });
            setSigningOut(false);
        }
    };

    return (
        <>
            <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg)' }}>

                {/* ── Dashboard Header bar ── */}
                <div
                    className="w-full px-6 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
                >
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 cursor-pointer group"
                        aria-label="Golden Waka — Home"
                    >
                        <img src="/images/logo.png" alt="" aria-hidden
                            className="h-6 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-200" />
                        <div className="flex flex-col leading-none gap-[3px]">
                            <span className="font-sans font-light text-[7.5px] tracking-[0.45em] uppercase"
                                style={{ color: '#d4af37' }}>Golden</span>
                            <span className="font-serif text-[13px] tracking-[0.06em]"
                                style={{ color: 'var(--text-primary)' }}>Waka</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* Admin Portal shortcut — only visible to admins */}
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="hidden sm:flex font-sans text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full items-center gap-1.5 cursor-pointer transition-all duration-200"
                                style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.4)' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.15)'; }}
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="#d4af37" aria-hidden>
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Admin Portal
                            </Link>
                        )}
                        <span
                            className="hidden sm:flex font-sans text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full items-center gap-1.5"
                            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#d4af37" aria-hidden>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Gold Member
                        </span>
                        <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="font-sans text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                                e.currentTarget.style.color = 'rgb(239,68,68)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {signingOut ? 'Signing out…' : 'Sign Out'}
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 pt-10">

                    {/* ── Welcome header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10"
                    >
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => setShowSettings(true)}
                                aria-label="Edit profile"
                                className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center font-serif text-xl shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2"
                                style={{ backgroundColor: '#d4af37', color: '#000', flexShrink: 0 }}
                            >
                                {localPhoto
                                    ? <img src={localPhoto} alt={firstName} className="w-full h-full object-cover" />
                                    : <span>{initials}</span>
                                }
                            </button>
                            <div>
                                <p className="font-sans text-[10px] uppercase tracking-[0.3em] mb-1"
                                    style={{ color: 'var(--text-subtle)' }}>
                                    Member Dashboard
                                </p>
                                <h1 className="font-serif text-3xl md:text-4xl"
                                    style={{ color: 'var(--text-primary)' }}>
                                    Welcome back, {firstName}.
                                </h1>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowReserve(true)}
                            className="hidden sm:flex items-center gap-2 font-sans text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 cursor-pointer"
                            style={{ backgroundColor: '#d4af37', color: '#000' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#d4af37'}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            New Trip
                        </button>
                    </motion.div>

                    {/* ── Stats strip ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <StatCard label="Total Trips"    value={trips.length}    sub="All requests"         delay={0.05} />
                        <StatCard label="Confirmed"      value={confirmedCount}  sub="Upcoming journeys"    delay={0.1}  />
                        <StatCard label="Pending"        value={pendingCount}    sub="Awaiting confirmation" delay={0.15} />
                        <StatCard label="Member Since"   value={memberSince}     sub="Golden Waka"          delay={0.2}  />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ── Left: Trips ── */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-serif text-xl" style={{ color: 'var(--text-primary)' }}>
                                    Your Reservations
                                </h2>
                                <button
                                    onClick={() => setShowReserve(true)}
                                    className="font-sans text-xs uppercase tracking-widest transition-colors duration-200 cursor-pointer"
                                    style={{ color: 'var(--text-subtle)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                                >
                                    + New Trip
                                </button>
                            </div>

                            {/* Loading state */}
                            {loadingTrips && (
                                <div className="space-y-4">
                                    <TripSkeleton />
                                    <TripSkeleton />
                                    <TripSkeleton />
                                </div>
                            )}

                            {/* Empty state */}
                            {!loadingTrips && trips.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center justify-center py-14 text-center rounded-2xl"
                                    style={{ border: '1px dashed var(--border)', backgroundColor: 'var(--bg-card)' }}
                                >
                                    <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
                                        strokeLinejoin="round" style={{ color: 'rgba(212,175,55,0.5)' }}>
                                        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <p className="font-serif text-xl mb-2"
                                        style={{ color: 'var(--text-primary)' }}>
                                        No reservations yet
                                    </p>
                                    <p className="font-sans text-sm mb-6 max-w-xs"
                                        style={{ color: 'var(--text-muted)' }}>
                                        Your upcoming journeys will appear here once you make a reservation.
                                    </p>
                                    <button
                                        onClick={() => setShowReserve(true)}
                                        className="font-sans text-xs uppercase tracking-widest px-7 py-3 rounded-full transition-all duration-200 cursor-pointer"
                                        style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = '#d4af37';
                                            e.currentTarget.style.color = '#000';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#d4af37';
                                        }}
                                    >
                                        Plan Your First Trip
                                    </button>
                                </motion.div>
                            )}

                            {/* Real trip cards */}
                            {!loadingTrips && trips.length > 0 && (
                                <div className="space-y-4">
                                    {trips.map((trip, i) => (
                                        <motion.div
                                            key={trip.id}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: i * 0.07 }}
                                            className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group"
                                            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-black/20">
                                                {trip.destinationImage ? (
                                                    <img
                                                        src={trip.destinationImage}
                                                        alt={trip.destination}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"
                                                        style={{ backgroundColor: 'var(--border)' }}>
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" strokeWidth="1.5"
                                                            style={{ color: 'var(--text-subtle)' }}>
                                                            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-serif text-base truncate"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {trip.destination}
                                                </p>
                                                <p className="font-sans text-xs mt-0.5"
                                                    style={{ color: 'var(--text-muted)' }}>
                                                    {formatDateRange(trip.departure, trip.returnDate)}
                                                    {trip.guests ? ` · ${trip.guests}` : ''}
                                                </p>
                                                {trip.destinationLocation && (
                                                    <p className="font-sans text-[10px] mt-0.5 uppercase tracking-wider"
                                                        style={{ color: 'var(--text-subtle)' }}>
                                                        {trip.destinationLocation}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status badge + updated time */}
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span
                                                    className="font-sans text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                                                    style={{
                                                        color: STATUS_COLORS[trip.status] || '#d4af37',
                                                        backgroundColor: `${STATUS_COLORS[trip.status] || '#d4af37'}18`,
                                                    }}
                                                >
                                                    {trip.status || 'Pending'}
                                                </span>
                                                {trip.updatedAt && (
                                                    <span className="font-sans text-[9px]" style={{ color: 'var(--text-subtle)' }}>
                                                        Updated {relativeTime(trip.updatedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Right: Profile + Quick Actions ── */}
                        <div className="space-y-6">

                            {/* Profile card */}
                            <motion.div
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.55, delay: 0.3 }}
                                className="p-6 rounded-2xl"
                                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p className="font-sans text-[10px] uppercase tracking-[0.25em]"
                                        style={{ color: 'var(--text-subtle)' }}>
                                        Profile
                                    </p>
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="font-sans text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors duration-200 cursor-pointer"
                                        style={{ color: 'var(--text-subtle)' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#d4af37'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" aria-hidden>
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                </div>

                                {/* Mini avatar + name */}
                                <div className="flex items-center gap-3 mb-5 pb-4"
                                    style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div
                                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-serif text-sm shrink-0"
                                        style={{ backgroundColor: '#d4af37', color: '#000' }}
                                    >
                                        {localPhoto
                                            ? <img src={localPhoto} alt={firstName} className="w-full h-full object-cover" />
                                            : <span>{initials}</span>
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-sans text-sm font-semibold truncate"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {localName || '—'}
                                        </p>
                                        <p className="font-sans text-[10px] truncate"
                                            style={{ color: 'var(--text-subtle)' }}>
                                            {currentUser?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="font-sans text-[10px] uppercase tracking-widest mb-0.5"
                                            style={{ color: 'var(--text-subtle)' }}>Member ID</p>
                                        <p className="font-mono text-xs"
                                            style={{ color: 'var(--text-muted)' }}>
                                            GW-{currentUser?.uid?.slice(0, 8).toUpperCase()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[10px] uppercase tracking-widest mb-0.5"
                                            style={{ color: 'var(--text-subtle)' }}>Total Reservations</p>
                                        <p className="font-sans text-sm"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {loadingTrips ? '—' : trips.length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-sans text-[10px] uppercase tracking-widest mb-0.5"
                                            style={{ color: 'var(--text-subtle)' }}>Member Since</p>
                                        <p className="font-sans text-sm"
                                            style={{ color: 'var(--text-primary)' }}>
                                            {memberSince}
                                        </p>
                                    </div>
                                </div>

                                {/* Edit Profile button */}
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-full mt-5 py-2.5 rounded-full font-sans text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                                        e.currentTarget.style.color = '#d4af37';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                    }}
                                >
                                    Edit Profile &amp; Password
                                </button>
                            </motion.div>

                            {/* Quick actions */}
                            <motion.div
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.55, delay: 0.4 }}
                            >
                                <p className="font-sans text-[10px] uppercase tracking-[0.25em] mb-4"
                                    style={{ color: 'var(--text-subtle)' }}>
                                    Quick Actions
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {quickActions.map((action, i) => (
                                        <Link
                                            key={i}
                                            to={action.to}
                                            className="p-4 rounded-2xl flex flex-col gap-2 transition-all duration-200 group cursor-pointer"
                                            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div style={{ color: '#d4af37' }}>{action.icon}</div>
                                            <div>
                                                <p className="font-sans text-xs font-semibold"
                                                    style={{ color: 'var(--text-primary)' }}>
                                                    {action.label}
                                                </p>
                                                <p className="font-sans text-[10px]"
                                                    style={{ color: 'var(--text-subtle)' }}>
                                                    {action.desc}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservation modal */}
            <AnimatePresence>
                {showReserve && <ReservationForm onClose={() => setShowReserve(false)} />}
            </AnimatePresence>

            {/* Profile settings modal */}
            <AnimatePresence>
                {showSettings && (
                    <ProfileSettingsModal
                        onClose={() => setShowSettings(false)}
                        onProfileUpdated={({ displayName: name, photoURL: photo }) => {
                            if (name  !== undefined) setLocalName(name);
                            if (photo !== undefined) setLocalPhoto(photo);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
