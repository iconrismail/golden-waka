import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { galleryData } from '../data/galleryData';

// ─── All unique categories ────────────────────────────────────────────────────
const allCategories = ['All', ...Array.from(new Set(galleryData.map(i => i.category)))];

// ─── Lightbox component ───────────────────────────────────────────────────────
function Lightbox({ item, items, onClose, onNavigate }) {
    const idx = items.findIndex(i => i.id === item.id);

    const handleKey = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') onNavigate((idx + 1) % items.length);
        if (e.key === 'ArrowLeft') onNavigate((idx - 1 + items.length) % items.length);
    }, [idx, items, onClose, onNavigate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
            style={{ backgroundColor: 'rgba(0,0,0,0.97)' }}
            onClick={onClose}
            onKeyDown={handleKey}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`Image: ${item.alt}`}
        >
            {/* Close */}
            <button
                onClick={onClose}
                aria-label="Close lightbox"
                className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md cursor-pointer transition-colors duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
            >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Counter */}
            <div
                className="absolute top-5 left-1/2 -translate-x-1/2 font-sans text-[10px] tracking-[0.35em] uppercase"
                style={{ color: 'rgba(255,255,255,0.4)' }}
            >
                {idx + 1} / {items.length}
            </div>

            {/* Prev */}
            {items.length > 1 && (
                <button
                    onClick={e => { e.stopPropagation(); onNavigate((idx - 1 + items.length) % items.length); }}
                    aria-label="Previous image"
                    className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md cursor-pointer transition-colors duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.25)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Next */}
            {items.length > 1 && (
                <button
                    onClick={e => { e.stopPropagation(); onNavigate((idx + 1) % items.length); }}
                    aria-label="Next image"
                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md cursor-pointer transition-colors duration-200 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.25)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Image */}
            <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-5xl w-full flex flex-col items-center"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl"
                    style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
                />
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 text-center px-4"
                >
                    <h3 className="font-serif text-xl md:text-2xl text-white mb-2">{item.caption}</h3>
                    <span
                        className="font-sans text-[9px] tracking-[0.35em] uppercase px-3 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}
                    >
                        {item.category}
                    </span>
                </motion.div>

                {/* Thumbnail strip */}
                {items.length > 1 && (
                    <div className="flex gap-2 mt-5 overflow-x-auto pb-1 max-w-full">
                        {items.map((thumb, ti) => (
                            <button
                                key={thumb.id}
                                onClick={e => { e.stopPropagation(); onNavigate(ti); }}
                                aria-label={`View ${thumb.alt}`}
                                className="w-12 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                                style={{
                                    opacity: thumb.id === item.id ? 1 : 0.45,
                                    border: `2px solid ${thumb.id === item.id ? '#d4af37' : 'transparent'}`,
                                }}
                            >
                                <img src={thumb.src} alt="" aria-hidden className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// ─── Gallery item card ─────────────────────────────────────────────────────────
function GalleryCard({ item, index, onOpen }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="break-inside-avoid mb-5 group relative overflow-hidden rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            tabIndex={0}
            role="button"
            aria-label={`View: ${item.alt}`}
            onClick={() => onOpen(item)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(item); } }}
        >
            <motion.img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-auto block"
            />

            {/* Hover overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col justify-end p-5"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
            >
                <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-serif text-base text-white mb-1 leading-tight">{item.caption}</p>
                    <span
                        className="font-sans text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}
                    >
                        {item.category}
                    </span>
                </div>

                {/* Expand icon */}
                <div
                    className="absolute top-4 right-4 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GalleryPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [lightboxItem, setLightboxItem] = useState(null);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 280], [1, 0]);
    const heroY = useTransform(scrollY, [0, 400], [0, -100]);

    const filtered = activeCategory === 'All'
        ? galleryData
        : galleryData.filter(i => i.category === activeCategory);

    const handleNavigate = (idx) => setLightboxItem(filtered[idx]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="relative pt-36 pb-20 px-6 overflow-hidden">
                {/* Ambient background image */}
                <motion.div style={{ y: heroY }} className="absolute inset-0 -z-0 scale-110">
                    <img
                        src={galleryData[0].src}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover opacity-10"
                        loading="eager"
                    />
                </motion.div>
                <div className="absolute inset-0 -z-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

                <motion.div style={{ opacity: heroOpacity }} className="relative max-w-6xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="font-sans text-[10px] tracking-[0.5em] uppercase mb-5 text-center"
                        style={{ color: '#d4af37' }}
                    >
                        {galleryData.length} Curated Moments
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                        className="font-serif text-center leading-[0.88] mb-6"
                        style={{
                            fontSize: 'clamp(5rem, 14vw, 12rem)',
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.03em',
                        }}
                    >
                        Moments.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="font-sans text-sm text-center uppercase tracking-[0.3em]"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        Capturing the art of travel
                    </motion.p>
                </motion.div>
            </div>

            {/* ── Category Filter ───────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    {allCategories.map((cat, i) => {
                        const isActive = activeCategory === cat;
                        const count = cat === 'All' ? galleryData.length : galleryData.filter(x => x.category === cat).length;
                        return (
                            <motion.button
                                key={cat}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveCategory(cat)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-semibold uppercase tracking-[0.22em] cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                                style={{
                                    backgroundColor: isActive ? '#d4af37' : 'var(--bg-card)',
                                    color: isActive ? '#000' : 'var(--text-muted)',
                                    border: `1px solid ${isActive ? '#d4af37' : 'var(--border)'}`,
                                }}
                            >
                                {cat}
                                <span
                                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.07)',
                                        color: isActive ? '#000' : 'var(--text-subtle)',
                                    }}
                                >
                                    {count}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Divider line */}
            <div className="max-w-6xl mx-auto px-6 mb-10">
                <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />
            </div>

            {/* ── Masonry grid ─────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="columns-1 sm:columns-2 lg:columns-3 gap-5"
                    >
                        {filtered.map((item, i) => (
                            <GalleryCard
                                key={item.id}
                                item={item}
                                index={i}
                                onOpen={setLightboxItem}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="font-serif text-xl" style={{ color: 'var(--text-muted)' }}>No images in this category</p>
                    </div>
                )}
            </div>

            {/* ── Footer strip ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="py-12 px-6 text-center"
                style={{ borderTop: '1px solid var(--border)' }}
            >
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: 'var(--text-subtle)' }}>
                    Every image a real memory
                </p>
                <p className="font-serif text-xl md:text-2xl" style={{ color: 'var(--text-primary)' }}>
                    Your journey, beautifully documented.
                </p>
            </motion.div>

            {/* ── Lightbox ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {lightboxItem && (
                    <Lightbox
                        item={lightboxItem}
                        items={filtered}
                        onClose={() => setLightboxItem(null)}
                        onNavigate={(idx) => setLightboxItem(filtered[idx])}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
