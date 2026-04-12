import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ─── Data ────────────────────────────────────────────────────────────────────

const milestones = [
    {
        year: '2014',
        title: 'The Beginning',
        desc: 'Founded in Cape Town with a single vision: travel should feel like art. Our first curated journey took three guests to the Maldives.',
        image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=1200&auto=format&fit=crop',
    },
    {
        year: '2016',
        title: 'Going Global',
        desc: 'Expanded to 24 destinations across four continents. Opened our first international office in London\'s Mayfair district.',
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop',
    },
    {
        year: '2019',
        title: 'Private Aviation',
        desc: 'Launched our bespoke private aviation division, giving members seamless door-to-destination access across 5,000+ airports worldwide.',
        image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1200&auto=format&fit=crop',
    },
    {
        year: '2021',
        title: 'Award of Excellence',
        desc: 'Recognised by Condé Nast Traveller as one of the world\'s Top 10 luxury travel companies. A humbling milestone for our entire team.',
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1200&auto=format&fit=crop',
    },
    {
        year: '2024',
        title: 'The Next Chapter',
        desc: 'Serving over 2,000 members across 68 countries. Every journey still crafted by hand, with the same obsessive care as the first.',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
    },
];

const values = [
    {
        num: '01',
        title: 'Obsessive Curation',
        desc: 'Every villa, yacht, and restaurant in our portfolio has been personally vetted. We accept fewer than 12% of properties that apply to join Golden Waka.',
    },
    {
        num: '02',
        title: 'Radical Transparency',
        desc: 'No hidden fees. No partner commissions that compromise our recommendations. Our loyalty is to you — full stop.',
    },
    {
        num: '03',
        title: 'Human-First Service',
        desc: 'Behind every booking is a human being who knows your preferences, your family, and what makes a perfect trip for you specifically.',
    },
    {
        num: '04',
        title: 'Responsible Luxury',
        desc: 'We offset 100% of travel emissions and direct 3% of every booking to conservation projects in the destinations you visit.',
    },
];

const team = [
    {
        name: 'Amara Osei',
        role: 'Founder & Chief Experience Officer',
        origin: 'Cape Town, SA',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
        quote: 'Luxury is not about price. It is about the feeling that someone truly understood you.',
    },
    {
        name: 'Marcus Vreeland',
        role: 'Head of Private Aviation',
        origin: 'London, UK',
        image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=800&auto=format&fit=crop',
        quote: 'The journey begins the moment you decide to go. We make everything else invisible.',
    },
    {
        name: 'Sakura Tanaka',
        role: 'Director of Asia Pacific',
        origin: 'Tokyo, Japan',
        image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=800&auto=format&fit=crop',
        quote: 'I open doors that most travellers never knew existed.',
    },
    {
        name: 'Rafael Monteiro',
        role: 'Villa & Estate Director',
        origin: 'Lisbon, Portugal',
        image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop',
        quote: 'Every great stay is a story. I find the properties worth telling.',
    },
];

const stats = [
    { value: '10+', label: 'Years of Excellence' },
    { value: '68', label: 'Countries Served' },
    { value: '2,000+', label: 'Global Members' },
    { value: '4.98', label: 'Average Rating' },
];

const press = [
    'Condé Nast Traveller',
    'Forbes Travel Guide',
    'The Sunday Times',
    'Wallpaper*',
    'Robb Report',
    'Town & Country',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MilestoneCard({ m, index }) {
    const isEven = index % 2 === 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col lg:flex-row gap-10 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}
        >
            {/* Image */}
            <div className="overflow-hidden rounded-3xl aspect-[4/3] w-full lg:w-1/2 shrink-0">
                <motion.img
                    src={m.image}
                    alt={m.title}
                    loading="lazy"
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-cover"
                />
            </div>
            {/* Text */}
            <div className="w-full lg:w-1/2 px-2 lg:px-8">
                <span
                    className="font-serif text-[clamp(4rem,8vw,7rem)] leading-none font-bold block mb-2"
                    style={{ color: 'rgba(212,175,55,0.15)', WebkitTextStroke: '1px rgba(212,175,55,0.3)' }}
                >
                    {m.year}
                </span>
                <h3 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
                    {m.title}
                </h3>
                <p className="font-sans text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {m.desc}
                </p>
            </div>
        </motion.div>
    );
}

function ValueCard({ v, index }) {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="p-8 rounded-3xl cursor-pointer transition-all duration-300"
            style={{
                border: `1px solid ${hovered ? 'rgba(212,175,55,0.4)' : 'var(--border)'}`,
                backgroundColor: hovered ? 'rgba(212,175,55,0.04)' : 'var(--bg-card)',
            }}
        >
            <span
                className="font-mono text-xs tracking-widest mb-4 block"
                style={{ color: '#d4af37' }}
            >
                {v.num}
            </span>
            <h3 className="font-serif text-xl mb-3" style={{ color: 'var(--text-primary)' }}>
                {v.title}
            </h3>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {v.desc}
            </p>
        </motion.div>
    );
}

function TeamCard({ member, index }) {
    const [flipped, setFlipped] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="cursor-pointer"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
        >
            <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                className="h-[420px] rounded-3xl"
            >
                {/* Front */}
                <div
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <img
                        src={member.image}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="font-serif text-lg text-white mb-1">{member.name}</p>
                        <p className="font-sans text-xs uppercase tracking-widest" style={{ color: '#d4af37' }}>{member.role}</p>
                        <p className="font-sans text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{member.origin}</p>
                    </div>
                </div>
                {/* Back */}
                <div
                    className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid rgba(212,175,55,0.25)',
                    }}
                >
                    <div className="w-12 h-px mb-6" style={{ backgroundColor: '#d4af37' }} />
                    <p className="font-serif text-xl leading-relaxed italic mb-6" style={{ color: 'var(--text-primary)' }}>
                        "{member.quote}"
                    </p>
                    <p className="font-sans text-xs uppercase tracking-[0.25em]" style={{ color: '#d4af37' }}>
                        {member.name}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AboutPage() {
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 600], [0, -180]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div ref={heroRef} className="relative h-screen overflow-hidden">
                <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
                    <img
                        src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2670&auto=format&fit=crop"
                        alt="Golden Waka — Our Story"
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                {/* Overlays */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.7) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, var(--bg) 100%)' }} />

                {/* Content */}
                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                >
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="font-sans text-[11px] tracking-[0.5em] uppercase mb-6"
                        style={{ color: '#d4af37' }}
                    >
                        Est. 2014 · Cape Town
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.15 }}
                        className="font-serif text-[clamp(3.5rem,10vw,9rem)] leading-none text-white mb-8"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        Our Story
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="font-sans text-lg max-w-md leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                        A decade of crafting journeys so extraordinary, they become part of who you are.
                    </motion.p>
                </motion.div>

                {/* Scroll cue */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="font-sans text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Scroll</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        className="w-px h-10"
                        style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.8), transparent)' }}
                    />
                </motion.div>
            </div>

            {/* ── Manifesto ─────────────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-6 py-28 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9 }}
                >
                    <div className="flex items-center justify-center gap-4 mb-10">
                        <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: 'rgba(212,175,55,0.3)' }} />
                        <span className="font-sans text-[10px] tracking-[0.4em] uppercase" style={{ color: '#d4af37' }}>Our Manifesto</span>
                        <div className="h-px flex-1 max-w-[80px]" style={{ backgroundColor: 'rgba(212,175,55,0.3)' }} />
                    </div>
                    <blockquote
                        className="font-serif text-[clamp(1.6rem,4vw,2.8rem)] leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        "We believe the finest journeys are the ones that change you —<br className="hidden md:block" />
                        not just in passport stamps, but in how you see the world."
                    </blockquote>
                    <p className="mt-8 font-sans text-sm" style={{ color: 'var(--text-subtle)' }}>
                        — Amara Osei, Founder
                    </p>
                </motion.div>
            </div>

            {/* ── Stats Strip ───────────────────────────────────────────────── */}
            <div
                className="py-16 px-6"
                style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
            >
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <p className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-none mb-2" style={{ color: '#d4af37' }}>
                                {s.value}
                            </p>
                            <p className="font-sans text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--text-subtle)' }}>
                                {s.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Timeline ──────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>Ten Years In The Making</p>
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)]" style={{ color: 'var(--text-primary)' }}>
                        The Journey So Far
                    </h2>
                </motion.div>
                <div className="space-y-24">
                    {milestones.map((m, i) => (
                        <MilestoneCard key={m.year} m={m} index={i} />
                    ))}
                </div>
            </div>

            {/* ── Values ────────────────────────────────────────────────────── */}
            <div
                className="py-28 px-6"
                style={{ backgroundColor: 'var(--bg-secondary, var(--bg))' }}
            >
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>
                            What We Stand For
                        </p>
                        <h2 className="font-serif text-[clamp(2.5rem,6vw,4rem)]" style={{ color: 'var(--text-primary)' }}>
                            Our Principles
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {values.map((v, i) => <ValueCard key={v.num} v={v} index={i} />)}
                    </div>
                </div>
            </div>

            {/* ── Team ──────────────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 py-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>
                        The People Behind The Magic
                    </p>
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,4rem)]" style={{ color: 'var(--text-primary)' }}>
                        Meet The Team
                    </h2>
                    <p className="font-sans text-sm mt-4 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Hover each card to hear from the people who make every journey extraordinary.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {team.map((member, i) => <TeamCard key={member.name} member={member} index={i} />)}
                </div>
            </div>

            {/* ── Press ─────────────────────────────────────────────────────── */}
            <div className="py-20 px-6" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="max-w-5xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center font-sans text-[10px] tracking-[0.4em] uppercase mb-12"
                        style={{ color: 'var(--text-subtle)' }}
                    >
                        As Featured In
                    </motion.p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        {press.map((name, i) => (
                            <motion.span
                                key={name}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="font-serif text-lg md:text-xl"
                                style={{ color: 'var(--text-subtle)' }}
                            >
                                {name}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA ───────────────────────────────────────────────────────── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop"
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--bg) 0%, rgba(0,0,0,0.5) 50%, var(--bg) 100%)' }} />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative max-w-3xl mx-auto px-6 py-32 text-center"
                >
                    <p className="font-sans text-[10px] tracking-[0.4em] uppercase mb-5" style={{ color: '#d4af37' }}>
                        Begin Your Story
                    </p>
                    <h2 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] mb-6" style={{ color: 'var(--text-primary)' }}>
                        Let us craft your next chapter.
                    </h2>
                    <p className="font-sans text-base mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                        Every great journey starts with a conversation. Tell us about your dream, and we will make it a memory.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="px-10 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                            style={{ backgroundColor: '#d4af37', color: '#000' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#d4af37'; }}
                        >
                            Start Planning
                        </Link>
                        <Link
                            to="/travel"
                            className="px-10 py-4 rounded-full font-sans text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.color = '#d4af37'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            Explore Destinations
                        </Link>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
