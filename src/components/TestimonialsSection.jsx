import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    {
        id: 1,
        name: "Alexandra M.",
        role: "CEO, Meridian Group",
        destination: "Kyoto Ancient Stays",
        quote: "An experience beyond language. The private tea ceremony at dawn, the bamboo forest at sunrise — Golden Waka understood exactly what we needed before we did.",
        rating: 5,
        initials: "AM",
    },
    {
        id: 2,
        name: "James & Charlotte T.",
        role: "Honeymooners",
        destination: "Amalfi Coast Villa",
        quote: "Our villa came with a private chef who knew every local producer by name. We forgot what ordinary felt like. This is how we travel now.",
        rating: 5,
        initials: "JT",
    },
    {
        id: 3,
        name: "David K.",
        role: "Partner, Sterling Ventures",
        destination: "Aspen Winter Chalet",
        quote: "Ski-in access, a heated outdoor pool, and a sommelier who happened to know my favourite Burgundy. The attention to detail was immaculate.",
        rating: 5,
        initials: "DK",
    },
    {
        id: 4,
        name: "Sophia R.",
        role: "Creative Director",
        destination: "Ubud Jungle Resort",
        quote: "I came to disconnect. I left transformed. The sunrise yoga above the jungle canopy is something I return to in my mind every single morning.",
        rating: 5,
        initials: "SR",
    },
    {
        id: 5,
        name: "Marcus W.",
        role: "Architect, Atelier W.",
        destination: "Northern Lights Igloo",
        quote: "We watched the aurora borealis from our glass-roofed pod while sipping Champagne. My daughter said it looked like the sky was breathing. She was right.",
        rating: 5,
        initials: "MW",
    },
];

const variants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function TestimonialsSection() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent(prev => (prev + 1) % testimonials.length);
    }, []);

    const prev = () => {
        setDirection(-1);
        setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const goTo = (index) => {
        setDirection(index > current ? 1 : -1);
        setCurrent(index);
    };

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const t = testimonials[current];

    return (
        <section
            className="py-28 px-6 relative overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
            {/* Giant background quote mark */}
            <div
                className="absolute top-12 left-1/2 -translate-x-1/2 font-serif leading-none select-none pointer-events-none"
                style={{
                    fontSize: '280px',
                    color: 'rgba(255,255,255,0.02)',
                    lineHeight: 1,
                }}
                aria-hidden
            >
                "
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <p
                        className="font-sans text-sm tracking-[0.3em] uppercase mb-4"
                        style={{ color: 'var(--accent)' }}
                    >
                        Traveller Stories
                    </p>
                    <h2 className="font-serif text-5xl md:text-6xl" style={{ color: 'var(--text-primary)' }}>
                        Voices of the Journey
                    </h2>
                </div>

                {/* Carousel */}
                <div className="relative min-h-[300px] flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="text-center px-4 md:px-16 absolute inset-0 flex flex-col items-center justify-center"
                        >
                            {/* Stars */}
                            <div className="flex justify-center gap-1 mb-8">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-4 h-4"
                                        style={{ fill: 'var(--accent)', color: 'var(--accent)' }}
                                        viewBox="0 0 20 20"
                                        aria-hidden
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote
                                className="font-serif text-xl md:text-2xl leading-relaxed mb-10"
                                style={{ color: 'var(--text-primary)', opacity: 0.9 }}
                            >
                                "{t.quote}"
                            </blockquote>

                            {/* Attribution */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold flex-shrink-0"
                                    style={{
                                        backgroundColor: 'rgba(212,175,55,0.15)',
                                        border: '1px solid rgba(212,175,55,0.4)',
                                        color: 'var(--accent)',
                                    }}
                                >
                                    {t.initials}
                                </div>
                                <div className="text-left">
                                    <p className="font-sans font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {t.name}
                                    </p>
                                    <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {t.role} · {t.destination}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8 mt-12">
                    <button
                        onClick={prev}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        aria-label="Previous testimonial"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Dot indicators */}
                    <div className="flex gap-2 items-center">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className="rounded-full transition-all duration-300 cursor-pointer"
                                style={{
                                    width: i === current ? '24px' : '8px',
                                    height: '8px',
                                    backgroundColor: i === current ? 'var(--accent)' : 'var(--border)',
                                }}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={next}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        aria-label="Next testimonial"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
