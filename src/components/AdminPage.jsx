import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import {
    collection, query, orderBy, onSnapshot,
    doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import {
    AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
    Pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   label: 'Pending'   },
    Confirmed: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    label: 'Confirmed' },
    Planning:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   label: 'Planning'  },
    Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    label: 'Cancelled' },
    Completed: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',   label: 'Completed' },
};

const ALL_STATUSES = Object.keys(STATUS_META);
const PIE_COLORS   = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#d4af37'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(r) {
    const n = `${r.firstName || ''} ${r.lastName || ''}`.trim();
    if (!n) return '?';
    const parts = n.split(' ').filter(Boolean);
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
}

function StatusBadge({ status }) {
    const m = STATUS_META[status] || { color: '#888', bg: 'rgba(136,136,136,0.1)', label: status };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            backgroundColor: m.bg,
            color: m.color,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: m.color, flexShrink: 0 }} />
            {m.label}
        </span>
    );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '10px 14px',
        }}>
            {label && <p style={{ color: '#d4af37', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ color: '#fff', fontSize: 13 }}>
                    {p.name !== 'value' && p.name !== 'count' && <span style={{ color: p.color || '#d4af37', marginRight: 6 }}>{p.name}:</span>}
                    <strong>{p.value}</strong>
                </p>
            ))}
        </div>
    );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV = [
    {
        id: 'overview', label: 'Overview',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        id: 'bookings', label: 'Bookings',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
        ),
    },
    {
        id: 'analytics', label: 'Analytics',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
];

function Sidebar({ active, onNav, user, userInitials, onSignOut, signingOut, open, onClose, pendingCount }) {
    const SIDE_BG   = '#0d0d0d';
    const SIDE_BORDER = 'rgba(255,255,255,0.07)';

    const content = (
        <div style={{
            width: 220, display: 'flex', flexDirection: 'column',
            height: '100%', backgroundColor: SIDE_BG,
            borderRight: `1px solid ${SIDE_BORDER}`,
        }}>
            {/* Logo */}
            <div style={{ padding: '28px 24px 24px', borderBottom: `1px solid ${SIDE_BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <img src="/images/logo.png" alt="" style={{ height: 26, opacity: 0.9 }} />
                    <div>
                        <div style={{ fontSize: 8, color: '#d4af37', letterSpacing: '0.45em', textTransform: 'uppercase', lineHeight: 1 }}>Golden</div>
                        <div style={{ fontSize: 15, color: '#fff', fontFamily: 'serif', letterSpacing: '0.06em' }}>Waka</div>
                    </div>
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 12,
                    backgroundColor: 'rgba(212,175,55,0.12)',
                    border: '1px solid rgba(212,175,55,0.25)',
                }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#d4af37" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span style={{ fontSize: 9, color: '#d4af37', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Admin Portal
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {NAV.map(item => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { onNav(item.id); onClose?.(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 10,
                                background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                                border: 'none',
                                borderLeft: isActive ? '2px solid #d4af37' : '2px solid transparent',
                                color: isActive ? '#d4af37' : 'rgba(255,255,255,0.5)',
                                fontSize: 13, fontWeight: isActive ? 600 : 400,
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                        >
                            {item.icon}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.id === 'bookings' && pendingCount > 0 && (
                                <span style={{
                                    minWidth: 18, height: 18, borderRadius: 9,
                                    backgroundColor: '#f59e0b', color: '#000',
                                    fontSize: 10, fontWeight: 800,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '0 5px', flexShrink: 0,
                                }}>
                                    {pendingCount > 99 ? '99+' : pendingCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '16px 12px', borderTop: `1px solid ${SIDE_BORDER}` }}>
                <Link to="/dashboard" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 12, textDecoration: 'none',
                    transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to App
                </Link>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', marginTop: 4,
                }}>
                    <span style={{
                        width: 32, height: 32, borderRadius: '50%',
                        backgroundColor: '#d4af37', color: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{userInitials}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.displayName || user?.email}
                        </div>
                        <button
                            onClick={onSignOut}
                            disabled={signingOut}
                            style={{
                                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                                background: 'none', border: 'none', padding: 0,
                                cursor: 'pointer', transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                        >
                            {signingOut ? 'Signing out…' : 'Sign out'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 220, zIndex: 30, display: 'none' }}
                className="lg:block"
            >
                {content}
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}
                        className="lg:hidden"
                        onClick={onClose}
                    >
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} />
                        <motion.div
                            initial={{ x: -220 }}
                            animate={{ x: 0 }}
                            exit={{ x: -220 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            style={{ position: 'relative', zIndex: 1 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {content}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color, delay, sub }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '20px 22px',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {label}
                </span>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    backgroundColor: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: 6 }}>
                {value}
            </div>
            {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
        </motion.div>
    );
}

// ─── Overview View ────────────────────────────────────────────────────────────

function OverviewView({ reservations, onNav, onStatusChange, updating }) {
    const total     = reservations.length;
    const pending   = reservations.filter(r => r.status === 'Pending').length;
    const confirmed = reservations.filter(r => r.status === 'Confirmed').length;
    const cancelled = reservations.filter(r => r.status === 'Cancelled').length;
    const recent    = reservations.slice(0, 8);

    // Status donut data
    const statusData = useMemo(() => {
        const counts = {};
        reservations.forEach(r => { counts[r.status || 'Unknown'] = (counts[r.status || 'Unknown'] || 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [reservations]);

    // Weekly bar data (last 8 weeks)
    const weeklyData = useMemo(() => {
        const weeks = [];
        for (let i = 7; i >= 0; i--) {
            const end   = new Date(); end.setDate(end.getDate() - i * 7);
            const start = new Date(end); start.setDate(start.getDate() - 7);
            weeks.push({
                week: `W${8 - i}`,
                Bookings: reservations.filter(r => {
                    if (!r.createdAt?.toDate) return false;
                    const d = r.createdAt.toDate();
                    return d >= start && d < end;
                }).length,
            });
        }
        return weeks;
    }, [reservations]);

    const CARD_ICON = (d) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {d}
        </svg>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <KpiCard label="Total Bookings" value={total}     color="#d4af37" delay={0}    sub="All time reservations"
                    icon={CARD_ICON(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></>)} />
                <KpiCard label="Pending Review" value={pending}   color="#f59e0b" delay={0.07} sub="Awaiting confirmation"
                    icon={CARD_ICON(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>)} />
                <KpiCard label="Confirmed"      value={confirmed} color="#22c55e" delay={0.14} sub="Ready to travel"
                    icon={CARD_ICON(<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>)} />
                <KpiCard label="Cancelled"      value={cancelled} color="#ef4444" delay={0.21} sub="Cancelled bookings"
                    icon={CARD_ICON(<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>)} />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
                {/* Status donut */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.28 }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 22px' }}
                >
                    <h3 style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                        Status Breakdown
                    </h3>
                    {statusData.length === 0 ? (
                        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                            No data yet
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                        dataKey="value" nameKey="name" paddingAngle={3}>
                                        {statusData.map((entry, i) => (
                                            <Cell key={i} fill={STATUS_META[entry.name]?.color || PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
                                {statusData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STATUS_META[d.name]?.color || PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{d.name} ({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Weekly bar */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.35 }}
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 22px' }}
                >
                    <h3 style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                        Bookings — Last 8 Weeks
                    </h3>
                    <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={weeklyData} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                            <Bar dataKey="Bookings" fill="#d4af37" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent bookings */}
            <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.42 }}
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}
            >
                <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Recent Bookings
                    </h3>
                    <button
                        onClick={() => onNav('bookings')}
                        style={{ fontSize: 12, color: '#d4af37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                        View all →
                    </button>
                </div>

                {recent.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                        No reservations yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    {['Guest', 'Destination', 'Travel Date', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((r, i) => (
                                    <tr key={r.id} style={{ borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <span style={{
                                                    width: 30, height: 30, borderRadius: '50%',
                                                    backgroundColor: 'rgba(212,175,55,0.15)', color: '#d4af37',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                                                }}>{initials(r)}</span>
                                                <div>
                                                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{r.firstName} {r.lastName}</div>
                                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{r.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ fontSize: 13, color: '#fff' }}>{r.destination || '—'}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{r.destinationLocation || ''}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{fmt(r.departure)}</td>
                                        <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {r.status === 'Pending' && (
                                                <button
                                                    onClick={() => onStatusChange(r, 'Confirmed')}
                                                    disabled={updating.has(r.id)}
                                                    style={{
                                                        padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                        backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e',
                                                        border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer',
                                                        opacity: updating.has(r.id) ? 0.5 : 1, transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {updating.has(r.id) ? '…' : 'Confirm'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── Bookings View ────────────────────────────────────────────────────────────

function BookingsView({ reservations, onStatusChange, updating }) {
    const [search, setSearch]       = useState('');
    const [filter, setFilter]       = useState('All');
    const [expanded, setExpanded]   = useState(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return reservations.filter(r => {
            const matchSearch = !q ||
                `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
                (r.email || '').toLowerCase().includes(q) ||
                (r.destination || '').toLowerCase().includes(q);
            const matchFilter = filter === 'All' || r.status === filter;
            return matchSearch && matchFilter;
        });
    }, [reservations, search, filter]);

    const FILTERS = ['All', ...ALL_STATUSES];

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Search + filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text" placeholder="Search guest, destination, email…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: 13, outline: 'none',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s',
                            backgroundColor: filter === f
                                ? (f === 'All' ? '#d4af37' : (STATUS_META[f]?.bg || 'rgba(212,175,55,0.15)'))
                                : 'rgba(255,255,255,0.05)',
                            color: filter === f
                                ? (f === 'All' ? '#000' : (STATUS_META[f]?.color || '#d4af37'))
                                : 'rgba(255,255,255,0.5)',
                            border: filter === f
                                ? `1px solid ${f === 'All' ? '#d4af37' : (STATUS_META[f]?.color || '#d4af37')}40`
                                : '1px solid rgba(255,255,255,0.1)',
                        }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
                {filter !== 'All' ? ` · ${filter}` : ''}
                {search ? ` · "${search}"` : ''}
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
                        {search || filter !== 'All' ? 'No bookings match your search.' : 'No bookings yet.'}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                    {['Guest', 'Destination', 'Travel Dates', 'Guests', 'Budget', 'Status', 'Booked', ''].map(h => (
                                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, i) => (
                                    <>
                                        <tr
                                            key={r.id}
                                            style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                backgroundColor: expanded === r.id ? 'rgba(212,175,55,0.04)' : 'transparent',
                                                transition: 'background 0.2s',
                                            }}
                                        >
                                            {/* Guest */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        backgroundColor: 'rgba(212,175,55,0.12)', color: '#d4af37',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                                                    }}>{initials(r)}</span>
                                                    <div>
                                                        <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.firstName} {r.lastName}</div>
                                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Destination */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontSize: 13, color: '#fff', whiteSpace: 'nowrap' }}>{r.destination || '—'}</div>
                                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{r.destinationLocation || ''}</div>
                                            </td>
                                            {/* Dates */}
                                            <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                                                {fmt(r.departure)}{r.returnDate ? ` → ${fmt(r.returnDate)}` : ''}
                                            </td>
                                            {/* Guests */}
                                            <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                                                {r.guests || '—'}
                                            </td>
                                            {/* Budget */}
                                            <td style={{ padding: '14px 16px', fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                                                {r.budget || '—'}
                                            </td>
                                            {/* Status select */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <select
                                                    value={r.status || 'Pending'}
                                                    disabled={updating.has(r.id)}
                                                    onChange={e => onStatusChange(r, e.target.value)}
                                                    style={{
                                                        padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                                        backgroundColor: STATUS_META[r.status]?.bg || 'rgba(255,255,255,0.08)',
                                                        color: STATUS_META[r.status]?.color || '#fff',
                                                        border: `1px solid ${STATUS_META[r.status]?.color || '#fff'}30`,
                                                        cursor: 'pointer', outline: 'none',
                                                        opacity: updating.has(r.id) ? 0.5 : 1,
                                                    }}
                                                >
                                                    {ALL_STATUSES.map(s => (
                                                        <option key={s} value={s} style={{ backgroundColor: '#1a1a1a', color: STATUS_META[s]?.color }}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            {/* Booked */}
                                            <td style={{ padding: '14px 16px', fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
                                                {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                            </td>
                                            {/* Expand toggle */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <button
                                                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                                    style={{
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        backgroundColor: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s', flexShrink: 0,
                                                    }}
                                                    aria-label="Toggle details"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                                        style={{ transform: expanded === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded detail row */}
                                        <AnimatePresence>
                                            {expanded === r.id && (
                                                <tr key={`${r.id}-detail`}>
                                                    <td colSpan={8} style={{ padding: 0 }}>
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                                            style={{ overflow: 'hidden' }}
                                                        >
                                                            <div style={{
                                                                padding: '20px 24px',
                                                                backgroundColor: 'rgba(212,175,55,0.03)',
                                                                borderTop: '1px solid rgba(212,175,55,0.1)',
                                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                            }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                                                                    <DetailGroup label="Contact">
                                                                        <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 7 }}>
                                                                            {r.phone ? (
                                                                                <a href={`tel:${r.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.61 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.62 17.5z" /></svg>
                                                                                    <span style={{ fontSize: 12, color: '#fff' }}>{r.phone}</span>
                                                                                </a>
                                                                            ) : (
                                                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>No phone provided</span>
                                                                            )}
                                                                            {r.email && (
                                                                                <a href={`mailto:${r.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                                                    <span style={{ fontSize: 12, color: '#fff', wordBreak: 'break-all' }}>{r.email}</span>
                                                                                </a>
                                                                            )}
                                                                            {r.email && (
                                                                                <a
                                                                                    href={`mailto:${r.email}?subject=Your Golden Waka Reservation — ${encodeURIComponent(r.destination || 'Booking')} Update&body=Dear ${encodeURIComponent(r.firstName || 'Valued Guest')},%0A%0AThank you for choosing Golden Waka. We have an update regarding your reservation for ${encodeURIComponent(r.destination || 'your upcoming trip')}.%0A%0APlease feel free to reply to this email or contact your dedicated concierge with any questions.%0A%0AWarm regards,%0AThe Golden Waka Concierge Team`}
                                                                                    style={{
                                                                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                                                                        padding: '5px 12px', borderRadius: 6, marginTop: 2,
                                                                                        backgroundColor: 'rgba(212,175,55,0.1)',
                                                                                        border: '1px solid rgba(212,175,55,0.25)',
                                                                                        color: '#d4af37', fontSize: 11, fontWeight: 600,
                                                                                        textDecoration: 'none', cursor: 'pointer',
                                                                                        transition: 'background 0.2s',
                                                                                    }}
                                                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.2)'}
                                                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.1)'}
                                                                                >
                                                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                                                    Email Client
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </DetailGroup>
                                                                    <DetailGroup label="Booking">
                                                                        <DetailItem k="Trip Type"     v={r.tripType || '—'} />
                                                                        <DetailItem k="Accommodation" v={r.accommodation || '—'} />
                                                                        <DetailItem k="Budget"        v={r.budget || '—'} />
                                                                    </DetailGroup>
                                                                    <DetailGroup label="Requests">
                                                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginTop: 4 }}>
                                                                            {r.requests || 'None provided.'}
                                                                        </p>
                                                                    </DetailGroup>
                                                                    <DetailGroup label="Quick Actions">
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                                                            {r.status !== 'Confirmed' && (
                                                                                <ActionBtn label="Confirm"  color="#22c55e" onClick={() => onStatusChange(r, 'Confirmed')} disabled={updating.has(r.id)} />
                                                                            )}
                                                                            {r.status === 'Pending' && (
                                                                                <ActionBtn label="Planning" color="#3b82f6" onClick={() => onStatusChange(r, 'Planning')}  disabled={updating.has(r.id)} />
                                                                            )}
                                                                            {r.status === 'Confirmed' && (
                                                                                <ActionBtn label="Complete" color="#a855f7" onClick={() => onStatusChange(r, 'Completed')} disabled={updating.has(r.id)} />
                                                                            )}
                                                                            {r.status !== 'Cancelled' && r.status !== 'Completed' && (
                                                                                <ActionBtn label="Cancel"   color="#ef4444" onClick={() => onStatusChange(r, 'Cancelled')} disabled={updating.has(r.id)} />
                                                                            )}
                                                                        </div>
                                                                    </DetailGroup>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function DetailGroup({ label, children }) {
    return (
        <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
                {label}
            </div>
            {children}
        </div>
    );
}

function DetailItem({ k, v }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
            <span style={{ fontSize: 12, color: '#fff', textAlign: 'right' }}>{v}</span>
        </div>
    );
}

function ActionBtn({ label, color, onClick, disabled }) {
    return (
        <button
            onClick={onClick} disabled={disabled}
            style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                backgroundColor: `${color}15`, color, border: `1px solid ${color}30`,
                cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.backgroundColor = `${color}25`; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.backgroundColor = `${color}15`; }}
        >
            {disabled ? '…' : label}
        </button>
    );
}

// ─── Analytics View ───────────────────────────────────────────────────────────

function AnalyticsView({ reservations }) {
    // Bookings per month (last 6 months)
    const monthlyData = useMemo(() => {
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            result.push({
                month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                Bookings: reservations.filter(r => {
                    if (!r.createdAt?.toDate) return false;
                    const rd = r.createdAt.toDate();
                    return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
                }).length,
            });
        }
        return result;
    }, [reservations]);

    // Budget distribution
    const budgetData = useMemo(() => {
        const RANGES = ['$3,000 – $5,000', '$5,000 – $10,000', '$10,000 – $20,000', '$20,000 – $50,000', '$50,000+'];
        return RANGES.map(b => ({
            name: b.replace('$', '').replace(/,\d{3}/g, 'k').replace(' – ', '-').replace('+', '+'),
            value: reservations.filter(r => r.budget === b).length,
        }));
    }, [reservations]);

    // Trip types
    const tripData = useMemo(() => {
        const counts = {};
        reservations.forEach(r => {
            if (r.tripType) {
                const short = r.tripType.split(' & ')[0].split(' ')[0];
                counts[short] = (counts[short] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [reservations]);

    // Accommodation preferences
    const accomData = useMemo(() => {
        const counts = {};
        reservations.forEach(r => {
            if (r.accommodation) counts[r.accommodation] = (counts[r.accommodation] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [reservations]);

    // Summary stats
    const mostPopDest = useMemo(() => {
        const counts = {};
        reservations.forEach(r => { if (r.destination) counts[r.destination] = (counts[r.destination] || 0) + 1; });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return top ? top[0] : 'N/A';
    }, [reservations]);

    const avgGuests = useMemo(() => {
        const nums = reservations.map(r => parseInt(r.guests) || 0).filter(n => n > 0);
        return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '—';
    }, [reservations]);

    const ChartCard = ({ title, children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 22px' }}
        >
            <h3 style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                {title}
            </h3>
            {children}
        </motion.div>
    );

    const noData = (
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            No data yet
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Summary callouts */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}
            >
                {[
                    { label: 'Total Bookings',       value: reservations.length, color: '#d4af37' },
                    { label: 'Most Popular Dest.',   value: mostPopDest,         color: '#22c55e' },
                    { label: 'Avg. Party Size',      value: avgGuests,           color: '#3b82f6' },
                    { label: 'Pending Action',       value: reservations.filter(r => r.status === 'Pending').length, color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        backgroundColor: `${color}10`, border: `1px solid ${color}25`,
                        borderRadius: 12, padding: '14px 18px',
                    }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                    </div>
                ))}
            </motion.div>

            {/* Monthly bookings trend */}
            <ChartCard title="Bookings Trend — Last 6 Months" delay={0.07}>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData}>
                        <defs>
                            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#d4af37" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                        <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.3)', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="Bookings" stroke="#d4af37" strokeWidth={2} fill="url(#goldGrad)" dot={{ fill: '#d4af37', r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Budget + Trip type row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ChartCard title="Budget Distribution" delay={0.14}>
                    {budgetData.every(d => d.value === 0) ? noData : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={budgetData} layout="vertical" barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                                <Bar dataKey="value" name="Bookings" fill="#d4af37" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard title="Trip Type Breakdown" delay={0.21}>
                    {tripData.length === 0 ? noData : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={tripData} cx="50%" cy="50%" outerRadius={65} dataKey="value" nameKey="name" paddingAngle={3}>
                                        {tripData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<DarkTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px', marginTop: 6 }}>
                                {tripData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{d.name} ({d.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </ChartCard>
            </div>

            {/* Accommodation preferences */}
            <ChartCard title="Accommodation Preferences" delay={0.28}>
                {accomData.length === 0 ? noData : (
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={accomData} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                            <Bar dataKey="value" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCard>
        </div>
    );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
    const { currentUser, signOut } = useAuth();
    const toast = useToast();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [activeView, setActiveView]     = useState('overview');
    const [updating, setUpdating]         = useState(new Set());
    const [signingOut, setSigningOut]     = useState(false);
    const [sidebarOpen, setSidebarOpen]   = useState(false);

    // User initials
    const userInitials = (() => {
        if (!currentUser) return 'A';
        if (currentUser.displayName) {
            const parts = currentUser.displayName.trim().split(' ').filter(Boolean);
            return parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : parts[0].slice(0, 2).toUpperCase();
        }
        return currentUser.email?.[0]?.toUpperCase() || 'A';
    })();

    // Real-time reservations subscription (top-level admin collection)
    useEffect(() => {
        const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, err => {
            console.error('Admin snapshot error:', err);
            setLoading(false);
        });
        return unsub;
    }, []);

    // Status update — updates top-level + user subcollection best-effort
    const handleStatusChange = async (reservation, newStatus) => {
        if (reservation.status === newStatus) return;
        const guestName = `${reservation.firstName || ''} ${reservation.lastName || ''}`.trim() || 'Guest';
        setUpdating(prev => new Set([...prev, reservation.id]));
        try {
            const stamp = { status: newStatus, updatedAt: serverTimestamp() };
            await updateDoc(doc(db, 'reservations', reservation.id), stamp);
            // Best-effort sync to user subcollection (works when doc IDs match)
            if (reservation.userId) {
                try {
                    await updateDoc(
                        doc(db, 'users', reservation.userId, 'reservations', reservation.id),
                        stamp
                    );
                } catch { /* subcollection doc may not exist on older reservations */ }
            }
            toast({ title: 'Status Updated', message: `${guestName}'s booking marked as ${newStatus}.`, type: 'success' });
        } catch (err) {
            toast({ title: 'Update Failed', message: err.message || 'Could not update status.', type: 'error' });
        }
        setUpdating(prev => { const n = new Set(prev); n.delete(reservation.id); return n; });
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        try { await signOut(); } catch { setSigningOut(false); }
    };

    const VIEW_TITLE = { overview: 'Overview', bookings: 'All Bookings', analytics: 'Analytics' };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#080808', color: '#fff', fontFamily: 'inherit' }}>
            {/* Sidebar */}
            <Sidebar
                active={activeView}
                onNav={setActiveView}
                user={currentUser}
                userInitials={userInitials}
                onSignOut={handleSignOut}
                signingOut={signingOut}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                pendingCount={reservations.filter(r => r.status === 'Pending').length}
            />

            {/* Main */}
            <main style={{ flex: 1 }} className="lg:ml-[220px]">
                {/* Top bar */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 20,
                    backgroundColor: 'rgba(8,8,8,0.9)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    padding: '16px 28px',
                    display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
                        aria-label="Open sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{VIEW_TITLE[activeView]}</h1>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Live indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Live</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }} className="hidden sm:inline">
                            {reservations.length} booking{reservations.length !== 1 ? 's' : ''}
                        </span>
                        {/* Sign Out — visible in top bar on desktop */}
                        <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="hidden sm:flex"
                            style={{
                                alignItems: 'center', gap: 6,
                                padding: '6px 14px', borderRadius: 8,
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.45)',
                                fontSize: 12, cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: signingOut ? 0.5 : 1,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {signingOut ? '…' : 'Sign Out'}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '28px 28px 60px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    height: 80, borderRadius: 16,
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    animation: 'pulse 1.8s ease-in-out infinite',
                                }} />
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key={activeView}>
                                {activeView === 'overview'  && <OverviewView  reservations={reservations} onNav={setActiveView} onStatusChange={handleStatusChange} updating={updating} />}
                                {activeView === 'bookings'  && <BookingsView  reservations={reservations} onStatusChange={handleStatusChange} updating={updating} />}
                                {activeView === 'analytics' && <AnalyticsView reservations={reservations} />}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    );
}
