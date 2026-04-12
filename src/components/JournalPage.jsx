import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { blogData } from '../data/blogData';

// ─── Tag mapping (no need to touch blogData) ─────────────────────────────────
const tagMap = {
    1: 'Aviation',
    2: 'Destinations',
    3: 'Destinations',
    4: 'Experiences',
};

const allFilters = ['All', 'Destinations', 'Aviation', 'Experiences'];

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({ post, index, featured = false }) {
    const tag = tagMap[post.id] || 'Travel';

    if (featured) {
        return (
            <motion.article
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-3xl cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Image */}
                    <div className="relative overflow-hidden h-64 lg:h-auto lg:min-h-105">
                        <motion.img
                            src={post.image}
                            alt={post.title}
                            loading="eager"
                            whileHover={{ scale: 1.04 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to right, transparent 60%, rgba(13,13,13,0.8) 100%)' }} />
                        {/* Featured badge */}
                        <div className="absolute top-5 left-5">
                            <span className="font-sans text-[9px] uppercase tracking-[0.35em] px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: '#d4af37', color: '#000' }}>
                                Featured
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center p-8 lg:p-12"
                        style={{ backgroundColor: '#0d0d0d' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="font-sans text-[9px] uppercase tracking-[0.3em] px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}>
                                {tag}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-widest"
                                style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {post.readTime}
                            </span>
                        </div>

                        <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-5 transition-colors duration-300 group-hover:text-[#d4af37]"
                            style={{ color: 'var(--text-primary)' }}>
                            {post.title}
                        </h2>

                        <p className="font-sans text-sm leading-relaxed mb-8"
                            style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                            <span className="font-sans text-[11px] uppercase tracking-[0.2em]"
                                style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {post.date}
                            </span>
                            <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 group-hover:gap-3"
                                style={{ color: '#d4af37' }}>
                                Read Article
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth="2" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.article>
        );
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-col overflow-hidden rounded-3xl cursor-pointer transition-all duration-300"
            style={{
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'var(--bg-card)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
            {/* Image */}
            <div className="relative overflow-hidden aspect-video">
                <motion.img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-cover"
                />
                {/* Tag overlay */}
                <div className="absolute top-4 left-4">
                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] px-2.5 py-1 rounded-full backdrop-blur-md"
                        style={{ backgroundColor: 'rgba(13,13,13,0.7)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>
                        {tag}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-6">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {post.date}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {post.readTime}
                    </span>
                </div>

                <h3 className="font-serif text-xl leading-snug mb-3 transition-colors duration-300 group-hover:text-[#d4af37] flex-1"
                    style={{ color: 'var(--text-primary)' }}>
                    {post.title}
                </h3>

                <p className="font-sans text-sm leading-relaxed mb-6"
                    style={{ color: 'rgba(255,255,255,0.45)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 group-hover:gap-3 mt-auto"
                    style={{ color: '#d4af37' }}>
                    Read Article
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function JournalPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 400], [0, -80]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    const enriched = blogData.map(p => ({ ...p, tag: tagMap[p.id] || 'Travel' }));

    const filtered = activeFilter === 'All'
        ? enriched
        : enriched.filter(p => p.tag === activeFilter);

    const [featured, ...rest] = filtered;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden pt-36 pb-20 px-6">
                {/* Ambient background */}
                <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
                    <img
                        src={blogData[0].image}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover opacity-8"
                        style={{ opacity: 0.08 }}
                        loading="eager"
                    />
                </motion.div>
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse at center top, rgba(212,175,55,0.04) 0%, transparent 65%)' }} />

                <motion.div style={{ opacity: heroOpacity }}
                    className="relative max-w-6xl mx-auto">

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65 }}
                        className="font-sans text-[10px] uppercase tracking-[0.5em] mb-5 flex items-center gap-3"
                        style={{ color: '#d4af37' }}
                    >
                        <span className="h-px w-8 inline-block" style={{ backgroundColor: '#d4af37' }} />
                        {blogData.length} Articles · Travel Intelligence
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, delay: 0.1 }}
                        className="font-serif leading-[0.88] mb-6"
                        style={{
                            fontSize: 'clamp(4.5rem,13vw,11rem)',
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.03em',
                        }}
                    >
                        The Journal.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.75, delay: 0.3 }}
                        className="font-sans text-base max-w-lg leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                        Stories from the road. Expert guides, destination deep-dives, and the art of travelling with intention.
                    </motion.p>
                </motion.div>
            </div>

            {/* ── Filter bar ───────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <div className="flex items-center gap-3 flex-wrap">
                    {allFilters.map((f, i) => {
                        const isActive = activeFilter === f;
                        const count = f === 'All'
                            ? blogData.length
                            : enriched.filter(p => p.tag === f).length;
                        return (
                            <motion.button
                                key={f}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveFilter(f)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-xs font-semibold uppercase tracking-[0.22em] cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                                style={{
                                    backgroundColor: isActive ? '#d4af37' : 'var(--bg-card)',
                                    color: isActive ? '#000' : 'var(--text-muted)',
                                    border: `1px solid ${isActive ? '#d4af37' : 'var(--border)'}`,
                                }}
                            >
                                {f}
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.07)',
                                        color: isActive ? '#000' : 'var(--text-subtle)',
                                    }}>
                                    {count}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="max-w-6xl mx-auto px-6 mb-12">
                <div className="h-px"
                    style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />
            </div>

            {/* ── Article grid ──────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 pb-28">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {filtered.length === 0 ? (
                            <div className="py-24 text-center">
                                <p className="font-serif text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                                    No articles in this category yet.
                                </p>
                                <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Check back soon for new stories.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Featured article */}
                                {featured && (
                                    <ArticleCard post={featured} index={0} featured />
                                )}

                                {/* Remaining in 3-col grid */}
                                {rest.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {rest.map((post, idx) => (
                                            <ArticleCard key={post.id} post={post} index={idx} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Newsletter CTA strip ──────────────────────────────────────── */}
            <div className="py-20 px-6 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-sans text-[10px] uppercase tracking-[0.4em] mb-4"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Never miss a story
                </p>
                <h2 className="font-serif text-3xl md:text-4xl mb-6"
                    style={{ color: 'var(--text-primary)' }}>
                    Stories delivered to your inbox.
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="your@email.com"
                        className="flex-1 w-full rounded-full px-5 py-3 font-sans text-sm focus:outline-none"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#fff',
                        }}
                    />
                    <button
                        className="px-6 py-3 rounded-full font-sans text-xs font-bold uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all duration-300"
                        style={{ backgroundColor: '#d4af37', color: '#000' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d4af37'; }}
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
}
