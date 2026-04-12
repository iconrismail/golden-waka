import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { destinations } from '../data/destinations';
import ReservationForm from './ReservationForm';

// ─── Region mapping ───────────────────────────────────────────────────────────
const regionMap = {
    Japan: 'Asia',
    Indonesia: 'Asia',
    Italy: 'Europe',
    Greece: 'Europe',
    USA: 'Americas',
    Iceland: 'Nordic',
};

const filters = ['All', 'Asia', 'Europe', 'Americas', 'Nordic'];

// ─── Regular destination card ─────────────────────────────────────────────────
function DestCard({ dest, index, isFocused, onOpen, cardRef }) {
    const region = regionMap[dest.location] || 'Other';

    return (
        <motion.article
            ref={cardRef}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            tabIndex={0}
            role="button"
            aria-label={`${dest.title} — ${dest.location}. ${dest.price} per package. Press Enter to reserve.`}
            className="group relative overflow-hidden rounded-3xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            style={{
                height: '560px',
                border: `1px solid ${isFocused ? '#d4af37' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isFocused ? '0 0 50px rgba(212,175,55,0.18)' : 'none',
                transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => { if (!isFocused) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; }}
            onMouseLeave={e => { if (!isFocused) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            onClick={() => onOpen(dest)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(dest); } }}
        >
            {/* Image */}
            <motion.img
                src={dest.image}
                alt={`${dest.title} — ${dest.location}`}
                loading="lazy"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)' }}
            />

            {/* Top badges */}
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                <span
                    className="font-sans text-[9px] tracking-[0.35em] uppercase px-3 py-1.5 rounded-full backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}
                >
                    {dest.location}
                </span>
                <span
                    className="font-sans text-[9px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    {region}
                </span>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-7">
                {/* Desc — visible on hover */}
                <div className="overflow-hidden" style={{ maxHeight: 0, transition: 'max-height 0.4s ease' }}
                    ref={el => { if (el) { el.style.maxHeight = '0'; el.parentElement?.parentElement?.addEventListener('mouseenter', () => { el.style.maxHeight = '80px'; }); el.parentElement?.parentElement?.addEventListener('mouseleave', () => { el.style.maxHeight = '0'; }); } }}
                >
                    <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {dest.description}
                    </p>
                </div>

                <h3 className="font-serif text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight mb-4 text-white">
                    {dest.title}
                </h3>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="font-sans text-[9px] tracking-[0.3em] uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>From</p>
                        <p className="font-serif text-2xl" style={{ color: '#d4af37' }}>{dest.price}</p>
                    </div>
                    <span
                        className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase px-5 py-2.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        style={{ backgroundColor: '#d4af37', color: '#000' }}
                    >
                        Reserve
                    </span>
                </div>
            </div>

            {/* Mobile reserve btn */}
            <button
                className="md:hidden absolute bottom-5 right-5 z-10 font-sans text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full cursor-pointer"
                style={{ backgroundColor: '#d4af37', color: '#000' }}
                onClick={e => { e.stopPropagation(); onOpen(dest); }}
                aria-label={`Reserve ${dest.title}`}
            >
                Reserve
            </button>
        </motion.article>
    );
}

// ─── Featured card (spans 2 columns) ─────────────────────────────────────────
function FeaturedCard({ dest, onOpen }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-3xl cursor-pointer col-span-1 lg:col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            style={{ height: '580px', border: '1px solid rgba(255,255,255,0.06)' }}
            tabIndex={0}
            role="button"
            aria-label={`${dest.title} — Featured destination. Press Enter to reserve.`}
            onClick={() => onOpen(dest)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(dest); } }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
            <motion.img
                src={dest.image}
                alt={`${dest.title} — ${dest.location}`}
                loading="eager"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(130deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.6) 100%)' }} />

            {/* Featured badge */}
            <div className="absolute top-6 left-6">
                <span
                    className="font-sans text-[9px] tracking-[0.4em] uppercase px-3 py-1.5 rounded-full backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(212,175,55,0.2)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.45)' }}
                >
                    ★ Featured
                </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-9">
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {dest.location} · {regionMap[dest.location]}
                </p>
                <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none text-white mb-4">
                    {dest.title}
                </h2>
                <p className="font-sans text-sm leading-relaxed mb-6 max-w-md" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {dest.description}
                </p>
                <div className="flex items-center gap-5">
                    <div>
                        <p className="font-sans text-[9px] tracking-[0.3em] uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>From</p>
                        <p className="font-serif text-3xl" style={{ color: '#d4af37' }}>{dest.price}</p>
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); onOpen(dest); }}
                        className="px-8 py-3 rounded-full font-sans text-sm font-semibold uppercase tracking-widest cursor-pointer transition-all duration-200"
                        style={{ backgroundColor: '#d4af37', color: '#000' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d4af37'; }}
                    >
                        Reserve
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TravelPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedDestination, setSelectedDestination] = useState(null);
    const cardRefs = useRef({});
    const location = useLocation();
    const focusId = location.state?.focusId;
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, -120]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        if (!focusId) return;
        const el = cardRefs.current[focusId];
        if (!el) return;
        const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600);
        return () => clearTimeout(t);
    }, [focusId]);

    const filtered = destinations.filter(d =>
        activeFilter === 'All' || regionMap[d.location] === activeFilter
    );

    const showFeatured = activeFilter === 'All';
    const featured = showFeatured ? filtered[0] : null;
    const gridDests = showFeatured ? filtered.slice(1) : filtered;

    const countFor = f => f === 'All'
        ? destinations.length
        : destinations.filter(d => regionMap[d.location] === f).length;

    return (
        <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Cinematic Hero ───────────────────────────────────────────── */}
            <div ref={heroRef} className="relative h-[75vh] overflow-hidden">
                <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
                    <img
                        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2670&auto=format&fit=crop"
                        alt="Golden Waka — Destinations"
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                </motion.div>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.75) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 55%, var(--bg) 100%)' }} />

                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                >
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="font-sans text-[10px] tracking-[0.5em] uppercase mb-5"
                        style={{ color: '#d4af37' }}
                    >
                        {destinations.length} Curated Sanctuaries · {Object.keys(regionMap).length} Countries
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.12 }}
                        className="font-serif text-[clamp(3.5rem,10vw,8.5rem)] leading-none text-white mb-5"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        Plan Your<br />Journey
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                        className="font-sans text-base max-w-sm leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
                        Handpicked sanctuaries across the world's most extraordinary locations.
                    </motion.p>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        className="w-px h-10 mx-auto"
                        style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.8), transparent)' }}
                    />
                </motion.div>
            </div>

            {/* ── Filter bar ──────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 pt-14 pb-10">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {filters.map(f => {
                        const isActive = activeFilter === f;
                        return (
                            <motion.button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap cursor-pointer transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                                style={{
                                    backgroundColor: isActive ? '#d4af37' : 'var(--bg-card)',
                                    color: isActive ? '#000' : 'var(--text-muted)',
                                    border: `1px solid ${isActive ? '#d4af37' : 'var(--border)'}`,
                                }}
                            >
                                {f}
                                <span
                                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.07)',
                                        color: isActive ? '#000' : 'var(--text-subtle)',
                                    }}
                                >
                                    {countFor(f)}
                                </span>
                            </motion.button>
                        );
                    })}
                    <span className="ml-auto font-sans text-xs shrink-0 hidden sm:block" style={{ color: 'var(--text-subtle)' }}>
                        {filtered.length} destination{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ── Destination Grid ─────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 md:px-10 pb-28">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Featured row: 2/3 + 1/3 */}
                        {featured && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                <FeaturedCard dest={featured} onOpen={setSelectedDestination} />
                                {gridDests[0] && (
                                    <DestCard
                                        dest={gridDests[0]}
                                        index={1}
                                        isFocused={focusId === gridDests[0].id}
                                        onOpen={setSelectedDestination}
                                        cardRef={el => { cardRefs.current[gridDests[0].id] = el; }}
                                    />
                                )}
                            </div>
                        )}

                        {/* Remaining cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(featured ? gridDests.slice(1) : gridDests).map((dest, idx) => (
                                <DestCard
                                    key={dest.id}
                                    dest={dest}
                                    index={idx + (featured ? 2 : 0)}
                                    isFocused={focusId === dest.id}
                                    onOpen={setSelectedDestination}
                                    cardRef={el => { cardRefs.current[dest.id] = el; }}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-28 text-center"
                    >
                        <p className="font-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>No destinations found</p>
                        <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Try selecting a different region</p>
                    </motion.div>
                )}
            </div>

            {/* ── Bespoke CTA ──────────────────────────────────────────────── */}
            <div className="py-16 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'var(--text-subtle)' }}>
                        Don't see your dream destination?
                    </p>
                    <p className="font-serif text-2xl md:text-3xl mb-6" style={{ color: 'var(--text-primary)' }}>
                        We go wherever you dream.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block font-sans text-xs font-semibold uppercase tracking-widest px-8 py-3 rounded-full cursor-pointer transition-all duration-200"
                        style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#d4af37'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#d4af37'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d4af37'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; }}
                    >
                        Request a Bespoke Itinerary
                    </a>
                </motion.div>
            </div>

            {/* Reservation modal */}
            <AnimatePresence>
                {selectedDestination && (
                    <ReservationForm
                        destination={selectedDestination}
                        onClose={() => setSelectedDestination(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
