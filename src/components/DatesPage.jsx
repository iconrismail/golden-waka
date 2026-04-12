import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReservationForm from './ReservationForm';

// ─── Data ────────────────────────────────────────────────────────────────────

const seasons = [
    {
        id: 'spring',
        label: 'Spring',
        months: 'Mar — May',
        tagline: 'Bloom & Discovery',
        description: 'Cherry blossoms in Kyoto. Wildflowers across Tuscany. The world awakens in its most enchanting form.',
        image: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?q=80&w=1200&auto=format&fit=crop',
        color: '#7fb069',
        highlights: ['Kyoto Cherry Blossom Season', 'Amalfi Coast Opening', 'Morocco Desert Bloom', 'New Zealand Autumn Colours'],
        price: 'From $3,800',
        availability: 'High',
    },
    {
        id: 'summer',
        label: 'Summer',
        months: 'Jun — Aug',
        tagline: 'Sun & Celebration',
        description: 'Santorini at golden hour. Maldives crystal lagoons. This is the season the world comes alive on the water.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
        color: '#d4af37',
        highlights: ['Greek Island Hopping', 'Maldives Overwater Season', 'French Riviera Season', 'African Safari Peak'],
        price: 'From $4,500',
        availability: 'Limited',
    },
    {
        id: 'autumn',
        label: 'Autumn',
        months: 'Sep — Nov',
        tagline: 'Harvest & Warmth',
        description: 'Venetian palazzos at twilight. New England foliage. Patagonia before the winter. A season of golden endings.',
        image: 'https://images.unsplash.com/photo-1473496169904-658ba7574b0d?q=80&w=1200&auto=format&fit=crop',
        color: '#c97d4e',
        highlights: ['Patagonia Trekking Season', 'Japanese Koyo Foliage', 'Tuscany Harvest Experience', 'Maldives Whale Shark Season'],
        price: 'From $3,200',
        availability: 'Available',
    },
    {
        id: 'winter',
        label: 'Winter',
        months: 'Dec — Feb',
        tagline: 'Solitude & Magic',
        description: 'Northern Lights over Iceland. Ski chalets in Courchevel. The Maldives at its most tranquil. Winter is for the adventurous.',
        image: 'https://images.unsplash.com/photo-1518729371765-043b7d2fa4f4?q=80&w=1200&auto=format&fit=crop',
        color: '#7ab3d4',
        highlights: ['Northern Lights Arctic Circle', 'Maldives Dry Season', 'Courchevel Ski Season', 'South East Asia Winter Escape'],
        price: 'From $5,200',
        availability: 'Very Limited',
    },
];

const months = [
    { name: 'Jan', season: 'winter', best: ['Maldives', 'Thailand', 'Caribbean'] },
    { name: 'Feb', season: 'winter', best: ['Maldives', 'Bali', 'South Africa'] },
    { name: 'Mar', season: 'spring', best: ['Kyoto', 'Morocco', 'Jordan'] },
    { name: 'Apr', season: 'spring', best: ['Amalfi', 'Greece', 'Vietnam'] },
    { name: 'May', season: 'spring', best: ['Tuscany', 'Spain', 'Croatia'] },
    { name: 'Jun', season: 'summer', best: ['Santorini', 'Ibiza', 'Iceland'] },
    { name: 'Jul', season: 'summer', best: ['Maldives', 'French Riviera', 'Kenya'] },
    { name: 'Aug', season: 'summer', best: ['Amalfi', 'Mykonos', 'Swiss Alps'] },
    { name: 'Sep', season: 'autumn', best: ['Patagonia', 'New England', 'Japan'] },
    { name: 'Oct', season: 'autumn', best: ['Tuscany', 'Istanbul', 'Peru'] },
    { name: 'Nov', season: 'autumn', best: ['Maldives', 'Mexico', 'South Africa'] },
    { name: 'Dec', season: 'winter', best: ['Lapland', 'Courchevel', 'Caribbean'] },
];

const seasonColors = {
    winter: '#7ab3d4',
    spring: '#7fb069',
    summer: '#d4af37',
    autumn: '#c97d4e',
};

const availabilitySteps = [
    {
        step: '01',
        title: 'Share Your Vision',
        desc: 'Tell us your dream — dates, destinations, who you\'re travelling with, and any special requests. No detail is too small.',
        icon: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        step: '02',
        title: 'We Curate Options',
        desc: 'Within 24 hours, your personal travel designer will present 2–3 bespoke itinerary concepts tailored to your preferences.',
        icon: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
    {
        step: '03',
        title: 'Refine & Confirm',
        desc: 'We adjust every detail until it is exactly right. Once you\'re satisfied, we secure all bookings with a single seamless payment.',
        icon: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        step: '04',
        title: 'Travel in Style',
        desc: 'Your concierge is available 24/7 throughout. From private transfers to table reservations — we handle everything.',
        icon: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
            </svg>
        ),
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeasonCard({ season, isActive, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={onClick}
            className="cursor-pointer rounded-3xl overflow-hidden relative group"
            style={{
                border: `1px solid ${isActive ? season.color : 'var(--border)'}`,
                boxShadow: isActive ? `0 0 40px ${season.color}20` : 'none',
                transition: 'all 0.3s ease',
            }}
        >
            <div className="aspect-[3/4] relative overflow-hidden">
                <motion.img
                    src={season.image}
                    alt={season.label}
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                    style={{ filter: isActive ? 'none' : 'saturate(0.6) brightness(0.7)' }}
                />
                <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)`,
                        opacity: isActive ? 0.85 : 0.6,
                    }}
                />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <p className="font-sans text-[9px] tracking-[0.4em] uppercase mb-1" style={{ color: season.color }}>
                        {season.months}
                    </p>
                    <h3 className="font-serif text-3xl text-white mb-1">{season.label}</h3>
                    <p className="font-sans text-xs italic mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{season.tagline}</p>

                    {/* Availability badge */}
                    <span
                        className="inline-block font-sans text-[9px] uppercase tracking-widest px-3 py-1 rounded-full w-fit"
                        style={{
                            backgroundColor: `${season.color}18`,
                            color: season.color,
                            border: `1px solid ${season.color}40`,
                        }}
                    >
                        {season.availability}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

function MonthCell({ month, index }) {
    const color = seasonColors[month.season];
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.04 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="rounded-2xl p-4 cursor-pointer transition-all duration-300"
            style={{
                border: `1px solid ${hovered ? color : 'var(--border)'}`,
                backgroundColor: hovered ? `${color}08` : 'var(--bg-card)',
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="font-serif text-lg" style={{ color: hovered ? color : 'var(--text-primary)' }}>
                    {month.name}
                </span>
                <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            <AnimatePresence>
                {hovered && (
                    <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                    >
                        {month.best.map(dest => (
                            <li key={dest} className="font-sans text-[10px] flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                {dest}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
            {!hovered && (
                <p className="font-sans text-[9px] capitalize tracking-wide" style={{ color: 'var(--text-subtle)' }}>
                    {month.season}
                </p>
            )}
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DatesPage() {
    const [activeSeason, setActiveSeason] = useState('summer');
    const [showReserve, setShowReserve] = useState(false);
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 600], [0, -160]);
    const heroOpacity = useTransform(scrollY, [0, 350], [1, 0]);

    const currentSeason = seasons.find(s => s.id === activeSeason);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div ref={heroRef} className="relative h-[90vh] overflow-hidden">
                <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
                    <img
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop"
                        alt="Plan Your Stay"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.75) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, var(--bg) 100%)' }} />

                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="h-px w-8" style={{ backgroundColor: '#d4af37' }} />
                        <span className="font-sans text-[10px] tracking-[0.5em] uppercase" style={{ color: '#d4af37' }}>
                            2025 — 2026 Season
                        </span>
                        <div className="h-px w-8" style={{ backgroundColor: '#d4af37' }} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15 }}
                        className="font-serif text-[clamp(3.5rem,10vw,9rem)] leading-none text-white mb-6"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        Availability
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="font-sans text-lg max-w-lg leading-relaxed mb-10"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                        Every month holds a different wonder. Explore when to go, what to expect, and where the world is most magnificent.
                    </motion.p>
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        onClick={() => setShowReserve(true)}
                        className="px-10 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                        style={{ backgroundColor: '#d4af37', color: '#000' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d4af37'; }}
                    >
                        Reserve Your Dates
                    </motion.button>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        className="w-px h-10"
                        style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.8), transparent)' }}
                    />
                </motion.div>
            </div>

            {/* ── Season Selector ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>
                        Choose Your Season
                    </p>
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,4rem)]" style={{ color: 'var(--text-primary)' }}>
                        Every Season, A New World
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
                    {seasons.map((s) => (
                        <SeasonCard
                            key={s.id}
                            season={s}
                            isActive={activeSeason === s.id}
                            onClick={() => setActiveSeason(s.id)}
                        />
                    ))}
                </div>

                {/* Season Detail Panel */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSeason}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.45 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12 rounded-3xl"
                        style={{
                            border: `1px solid ${currentSeason.color}30`,
                            backgroundColor: `${currentSeason.color}05`,
                        }}
                    >
                        <div>
                            <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: currentSeason.color }}>
                                {currentSeason.months} · {currentSeason.label}
                            </p>
                            <h3 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
                                {currentSeason.tagline}
                            </h3>
                            <p className="font-sans text-base leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                                {currentSeason.description}
                            </p>
                            <p className="font-sans text-xs mb-2" style={{ color: 'var(--text-subtle)' }}>Starting price</p>
                            <p className="font-serif text-2xl mb-6" style={{ color: currentSeason.color }}>
                                {currentSeason.price}
                            </p>
                            <button
                                onClick={() => setShowReserve(true)}
                                className="px-8 py-3 rounded-full font-sans text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                                style={{ backgroundColor: currentSeason.color, color: '#000' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = currentSeason.color; }}
                            >
                                Book {currentSeason.label} Dates
                            </button>
                        </div>

                        <div>
                            <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-5" style={{ color: 'var(--text-subtle)' }}>
                                Season Highlights
                            </p>
                            <ul className="space-y-3">
                                {currentSeason.highlights.map((h, i) => (
                                    <motion.li
                                        key={h}
                                        initial={{ opacity: 0, x: 15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="flex items-center gap-4 py-3 group cursor-pointer"
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                    >
                                        <span
                                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs"
                                            style={{ backgroundColor: `${currentSeason.color}20`, color: currentSeason.color }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="font-sans text-sm" style={{ color: 'var(--text-primary)' }}>{h}</span>
                                        <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Monthly Calendar ──────────────────────────────────────────── */}
            <div
                className="py-24 px-6"
                style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary, var(--bg))' }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>
                            Month by Month
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)]" style={{ color: 'var(--text-primary)' }}>
                                Best Time to Visit
                            </h2>
                            <p className="font-sans text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
                                Hover any month to reveal the world's finest destinations for that time of year.
                            </p>
                        </div>
                    </motion.div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
                        {Object.entries(seasonColors).map(([season, color]) => (
                            <div key={season} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="font-sans text-xs capitalize" style={{ color: 'var(--text-subtle)' }}>{season}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
                        {months.map((m, i) => <MonthCell key={m.name} month={m} index={i} />)}
                    </div>
                </div>
            </div>

            {/* ── Booking Process ───────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>
                        Securing Your Journey
                    </p>
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,4rem)]" style={{ color: 'var(--text-primary)' }}>
                        How It Works
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {availabilitySteps.map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="relative p-7 rounded-3xl group"
                            style={{
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--bg-card)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                                e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.04)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                            }}
                        >
                            {/* Connector line */}
                            {i < availabilitySteps.length - 1 && (
                                <div
                                    className="hidden lg:block absolute top-8 left-full w-5 h-px z-10"
                                    style={{ backgroundColor: 'var(--border)' }}
                                />
                            )}
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5"
                                style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: '#d4af37' }}
                            >
                                {step.icon}
                            </div>
                            <span className="font-mono text-xs tracking-widest block mb-2" style={{ color: 'rgba(212,175,55,0.5)' }}>
                                {step.step}
                            </span>
                            <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                                {step.title}
                            </h3>
                            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Important Dates Notice ────────────────────────────────────── */}
            <div className="px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 p-8 rounded-3xl"
                        style={{ border: '1px solid rgba(212,175,55,0.2)', backgroundColor: 'rgba(212,175,55,0.03)' }}
                    >
                        {[
                            { label: 'Advance Booking', value: '6–12 months', note: 'Recommended for peak season travel' },
                            { label: 'Deposit Required', value: '20%', note: 'To secure your preferred dates' },
                            { label: 'Balance Due', value: '60 days prior', note: 'Before departure date' },
                        ].map((item, i) => (
                            <div key={i} className={`py-4 ${i > 0 ? 'md:border-l md:border-white/10 md:pl-8' : ''}`}>
                                <p className="font-sans text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--text-subtle)' }}>
                                    {item.label}
                                </p>
                                <p className="font-serif text-2xl mb-1" style={{ color: '#d4af37' }}>{item.value}</p>
                                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{item.note}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Final CTA ─────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=2000&auto=format&fit=crop"
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--bg) 0%, transparent 50%, var(--bg) 100%)' }} />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative max-w-3xl mx-auto px-6 py-32 text-center"
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: '#d4af37' }}>
                        Limited Availability
                    </p>
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] mb-5" style={{ color: 'var(--text-primary)' }}>
                        Your perfect dates are waiting.
                    </h2>
                    <p className="font-sans text-base mb-10 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Our most sought-after seasons fill quickly. Speak to a travel designer today and secure your place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setShowReserve(true)}
                            className="px-10 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                            style={{ backgroundColor: '#d4af37', color: '#000' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d4af37'; }}
                        >
                            Reserve Now
                        </button>
                        <Link
                            to="/contact"
                            className="px-10 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.color = '#d4af37'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            Speak to an Advisor
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Reservation Modal */}
            <AnimatePresence>
                {showReserve && <ReservationForm onClose={() => setShowReserve(false)} />}
            </AnimatePresence>
        </div>
    );
}
